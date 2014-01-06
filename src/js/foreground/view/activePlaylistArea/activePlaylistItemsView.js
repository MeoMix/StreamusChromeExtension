//  Represents the playlist items in a given playlist
define([
    'foreground/view/genericScrollableView',
    'foreground/collection/contextMenuGroups',
    'foreground/collection/streamItems',
    'foreground/view/activePlaylistArea/playlistItemView',
    'text!template/activePlaylistItems.html'
], function (GenericScrollableView, ContextMenuGroups, StreamItems, PlaylistItemView, ActivePlaylistItemsTemplate) {
    'use strict';

    var ActivePlaylistItemsView = GenericScrollableView.extend({
        
        className: 'left-list',

        template: _.template(ActivePlaylistItemsTemplate),
        
        events: {
            'contextmenu': 'showContextMenu',
            'click .listItem': 'addItemToStream'
        },
        
        attributes: {
            'id': 'activePlaylistItems'
        },
            
        render: function () {
            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n
                })
            ));

            //  Group playlistItems into chunks of 200 to render incrementally to prevent long-running operations.
            var chunkSize = 200;
            var playlistItemChunks = _.toArray(this.model.get('items').groupBy(function (playlistItem, index) {
                return Math.floor(index / chunkSize);
            }));

            this.incrementalRender(playlistItemChunks, function () {

                var lazyImages = this.$el.find('img.lazy');
    
                var lazyImagesInViewport = _.filter(lazyImages, function (lazyImage) {
                    return $.inviewport(lazyImage, { threshold: 0, container: this.el });
                }.bind(this));
                
                var lazyImagesNotInViewport = _.filter(lazyImages, function (lazyImage) {
                    return !$.inviewport(lazyImage, { threshold: 0, container: this.el });
                }.bind(this));
                
                $(lazyImagesInViewport).lazyload({
                    container: this.el
                });

                $(lazyImagesNotInViewport).lazyload({
                    effect: 'fadeIn',
                    threshold: 500,
                    container: this.el,
                    event: 'scroll manualShow'
                });

            }.bind(this));

            this.bindDroppable('.listItem:not(.videoSearchResult)');
            
            return this;
        },
        
        initialize: function() {

            var self = this;
            
            //  Allows for drag-and-drop of videos
            this.$el.sortable({

                //  Adding this helps prevent unwanted clicks to play
                delay: 100,
                //cancel: '.big-text',
                connectWith: '#streamItemList',
                appendTo: 'body',
                containment: 'body',
                placeholder: "sortable-placeholder listItem hiddenUntilChange",
                scroll: false,
                cursorAt: {
                    right: 35,
                    bottom: 40
                },
                tolerance: 'pointer',
                helper: function (ui, playlistItem) {

                    //  Create a new view instead of just copying the HTML in order to preserve HTML->Backbone.View relationship
                    var copyHelperView = new PlaylistItemView({
                        model: self.model.get('items').get(playlistItem.data('playlistitemid')),
                        //  Don't lazy-load the view because copy helper is clearly visible
                        instant: true
                    });
                    
                    this.copyHelper = copyHelperView.render().$el.insertAfter(playlistItem);
                    this.copyHelper.css({
                        opacity: '.5'
                    }).addClass('copyHelper');
                    
                    this.backCopyHelper = playlistItem.prev();
                    this.backCopyHelper.addClass('copyHelper');

                    $(this).data('copied', false);

                    return $('<span>', {
                        'class': 'videoSearchResultsLength',
                        'text': 1
                    });
                },
                change: function () {
                    //  There's a CSS redraw issue with my CSS selector: .listItem.copyHelper + .sortable-placeholder 
                    //  So, I manually hide the placehelper (like it would be normally) until a change occurs -- then the CSS can take over.
                    $('.hiddenUntilChange').removeClass('hiddenUntilChange');
                },
                start: function () {
                    $('body').addClass('dragging');
                },
                stop: function () {
                    $('body').removeClass('dragging');
                    this.backCopyHelper.removeClass('copyHelper');
                    
                    var copied = $(this).data('copied');
                    if (copied) {
                        this.copyHelper.css({
                            opacity: 1
                        }).removeClass('copyHelper');
                    }
                    else{
                        this.copyHelper.remove();
                    }

                    this.copyHelper = null;
                    this.backCopyHelper = null;
                },
                receive: function (event, ui) {

                    var streamItemId = $(ui.item).data('streamitemid');
                    var draggedStreamItem = StreamItems.get(streamItemId);
                    
                    //  It's important to do this to make sure I don't count my helper elements in index.
                    var index = parseInt(ui.item.parent().children('.listItem').index(ui.item));
                    
                    //  Remove blue coloring if visible before waiting for addVideo to finish to give a more seamless swap to the new item.
                    $(ui.item).removeClass('selected');
                    self.model.addByVideoAtIndex(draggedStreamItem.get('video'), index, function () {
                        //  Remove item because it's a stream item and I've just added a playlist item at that index.
                        $(ui.item).remove();
                    });

                    //  TODO: There's a bit of lag which happens while waiting for the add event to propagate to the parent.
                    //  This makes Streamus seem unresponsive but this is clearly an encapsulation break... need to fix!
                    var emptyPlaylistMessage = $('.playlistEmpty');
                    if (emptyPlaylistMessage.length > 0) {
                        emptyPlaylistMessage.addClass('hidden');
                    }

                    ui.sender.data('copied', true);
                },
                //  Whenever a video row is moved inform the Player of the new video list order
                update: function (event, ui) {
                    
                    var playlistItemId = ui.item.data('playlistitemid');

                    //  Don't run this code when handling stream items -- only when reorganizing playlist items.
                    if (this === ui.item.parent()[0] && playlistItemId) {
                        //  It's important to do this to make sure I don't count my helper elements in index.
                        var index = parseInt(ui.item.parent().children('.listItem').index(ui.item));
                        
                        var playlistItem = self.model.get('items').get(playlistItemId);
                        var originalindex = self.model.get('items').indexOf(playlistItem);

                        //  When moving an item down the list -- all the items shift up one which causes an off-by-one error when calling
                        //  movedPlaylistToIndex. Account for this by adding 1 to the index when moving down, but not when moving up since
                        //  no shift happens.
                        if (originalindex < index) {
                            index += 1;
                        }

                        self.model.moveItemToIndex(playlistItemId, index);
                    }
                }
            });
            
            this.listenTo(this.model.get('items'), 'add', this.addItem);
            
            this.listenTo(this.model.get('items'), 'remove', function () {
                //  Trigger a manual show because an item could slide into view and need to load it.
                this.$el.trigger('manualShow');
            });
        },
        
        incrementalRender: function (playlistItemChunks, onRenderComplete) {
            //  Render a chunk:
            if (playlistItemChunks.length > 0) {
                var playlistItemChunk = playlistItemChunks.shift();

                //  Build up the views for each playlistItem.
                var items = _.map(playlistItemChunk, function(playlistItem) {
                    var playlistItemView = new PlaylistItemView({
                        model: playlistItem
                    });

                    return playlistItemView.render().el;
                });

                //  Do this all in one DOM insertion to prevent lag in large playlists.
                this.$el.append(items);

                setTimeout(function() {
                    this.incrementalRender(playlistItemChunks, onRenderComplete);
                }.bind(this));

            } else {
                onRenderComplete();
            }

        },

        addItem: function (playlistItem) {

            var playlistItemView = new PlaylistItemView({
                model: playlistItem
            });

            var element = playlistItemView.render().$el;

            if (this.$el.find('.playlistItem').length > 0) {
                var playlistItems = this.model.get('items');
                var currentItemIndex = playlistItems.indexOf(playlistItem);

                var previousItem = playlistItems.at(currentItemIndex - 1);
                    
                if (previousItem) {
                    var previousItemId = previousItem.get('id');

                    var previousItemElement = this.$el.find('.playlistItem[data-playlistitemid="' + previousItemId + '"]');
                    previousItemElement.after(element);
                } else {
                    this.$el.find('.playlistItem').first().before(element);
                }
 
            } else {
                this.$el.append(element);
            }

            //  TODO: This is throwing crazy errors when I add items, no idea why. Consider writing my own is in viewport.
            //var inViewport = element.is(':in-viewport');
            playlistItemView.$el.find('img.lazy').lazyload({
                //  Looks bad to fade in when the item should just be visible.
                //effect: inViewport ? undefined : 'fadeIn',
                container: this.el,
                
                //threshold: inViewport ? undefined : 500,
                event: 'scroll manualShow'
            });
                
            this.scrollItemIntoView(playlistItem);
            this.initializeTooltips();
        },
        
        showContextMenu: function (event) {

            //  Whenever a context menu is shown -- set preventDefault to true to let foreground know to not reset the context menu.
            event.preventDefault();

            if (event.target === event.currentTarget || $(event.target).hasClass('big-text') || $(event.target).hasClass('i-4x')) {
                //  Didn't bubble up from a child -- clear groups.
                ContextMenuGroups.reset();
            }

            var self = this;
            
            var isPlaylistEmpty = this.model.get('items').length === 0;

            ContextMenuGroups.add({

                items: [{
                    text: chrome.i18n.getMessage('enqueuePlaylist'),
                    disabled: isPlaylistEmpty,
                    title: isPlaylistEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                    onClick: function () {

                        if (!isPlaylistEmpty) {
                            StreamItems.addByPlaylist(self.model, false);
                        }

                    }
                }, {
                    text: chrome.i18n.getMessage('playPlaylist'),
                    disabled: isPlaylistEmpty,
                    title: isPlaylistEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                    onClick: function () {

                        if (!isPlaylistEmpty) {
                            StreamItems.addByPlaylist(self.model, true);
                        }

                    }
                }]
            });

        },
        
        addItemToStream: function (event) {
            
            //  Add item to stream on dblclick.
            var playlistItemId = $(event.currentTarget).data('playlistitemid');
            var playlistItem = this.model.getPlaylistItemById(playlistItemId);

            StreamItems.addByPlaylistItem(playlistItem);
        },
        
        scrollItemIntoView: function(item) {
            var itemId = item.get('id');
            var activeItem = this.$el.find('.listItem[data-playlistitemid="' + itemId + '"]');

            if (activeItem.length > 0) {
                activeItem.scrollIntoView(true);
            }
        }

    });

    return ActivePlaylistItemsView;
});