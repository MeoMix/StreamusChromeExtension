//  TODO: Is this the activePlaylistView now?
//  Represents the videos in a given playlist
define([
    'contextMenuGroups',
    'streamItems',
    'playlistItemView',
    'text!../template/activePlaylistItems.htm',
    'utility'
], function (ContextMenuGroups, StreamItems, PlaylistItemView, ActivePlaylistItemsTemplate, Utility) {
    'use strict';

    var ActivePlaylistItemsView = Backbone.View.extend({
        
        className: 'left-list',

        template: _.template(ActivePlaylistItemsTemplate),
        
        events: {
            'contextmenu': 'showContextMenu',
            'click .playlistItem': 'addItemToStream'
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

            var self = this;
            this.incrementalRender(playlistItemChunks, function () {

                self.$el.find('img.lazy').lazyload({
                    container: self.$el,
                    event: 'scroll manualShow'
                });
            });
            
            return this;
        },
        
        initialize: function() {

            var self = this;
            
            //  Allows for drag-and-drop of videos
            this.$el.sortable({
                //axis: 'y',
                //  Adding this helps prevent unwanted clicks to play
                delay: 100,
                cancel: '.big-text',
                connectWith: '#streamItemList',
                appendTo: 'body',
                containment: 'body',
                placeholder: "sortable-placeholder",
                helper: function(e,li) {
                    this.copyHelper = li.clone().insertAfter(li);

                    $(this).data('copied', false);

                    return li.clone();
                },
                stop: function () {
                    var copied = $(this).data('copied');

                    if (!copied) {
                        this.copyHelper.remove();
                    }

                    this.copyHelper = null;
                },

                //  Whenever a video row is moved inform the Player of the new video list order
                update: function (event, ui) {

                    console.log("Update:", event, ui);

                    return;

                    var newIndex = parseInt(ui.item.index());

                    var nextIndex = newIndex + 1;
                    var highSequence = 10000;

                    if (nextIndex <= self.model.get('items').length) {

                        var nextItemElement = self.$el.find('.playlistItem:eq(' + nextIndex + ')');

                        if (nextItemElement != null) {
                            var nextItemId = nextItemElement.data('playlistitemid');
                            var nextItem = self.model.get('items').get(nextItemId);
                            highSequence = nextItem.get('sequence');
                        }

                    }

                    var previousIndex = newIndex - 1;
                    var lowSequence = 0;
                    
                    if (previousIndex > 0) {
                        
                        var previousItemElement = self.$el.find('.playlistItem:eq(' + previousIndex + ')');

                        if (previousItemElement != null) {
                            var previousItemId = previousItemElement.data('playlistitemid');
                            var previousItem = self.model.get('items').get(previousItemId);
                            lowSequence = previousItem.get('sequence');
                        }

                    }

                    var itemId = ui.item.data('playlistitemid');
                    var item = self.model.get('items').get(itemId);

                    var averageSequence = (highSequence + lowSequence) / 2;

                    item.set('sequence', averageSequence);
                    item.save();
                    self.model.get('items').sort();
                }
            });

            this.listenTo(this.model.get('items'), 'add', this.addItem);
            
            this.listenTo(this.model.get('items'), 'empty', this.render);
            this.listenTo(this.model.get('items'), 'remove', function () {
                //  Trigger a manual show because an item could slide into view and need to load it.
                this.$el.trigger('manualShow');
            });

            Utility.scrollChildElements(this.el, 'span.item-title');
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
                var previousItemId = playlistItems.at(currentItemIndex - 1).get('id');
                
                var previousItemElement = this.$el.find('.playlistItem[data-playlistitemid="' + previousItemId + '"]');
                element.insertAfter(previousItemElement);

            } else {

                //  TODO: Not very good practice to remove it like this.
                $('.big-text').remove();
    
                element.appendTo(this.$el);
            }

            element.find('img.lazy').lazyload({
                effect: 'fadeIn',
                container: this.$el,
                event: 'scroll manualShow'
            }).bind(this);
                
            this.scrollItemIntoView(playlistItem);
        },
        
        showContextMenu: function (event) {

            //  Whenever a context menu is shown -- set preventDefault to true to let foreground know to not reset the context menu.
            event.preventDefault();

            if (event.target === event.currentTarget) {
                //  Didn't bubble up from a child -- clear groups.
                ContextMenuGroups.reset();
            }

            var self = this;

            var isAddPlaylistDisabled = this.model.get('items').length === 0;
            var isPlayPlaylistDisabled = this.model.get('items').length === 0;

            ContextMenuGroups.add({

                items: [{
                    text: chrome.i18n.getMessage("addPlaylistToStream"),
                    disabled: isAddPlaylistDisabled,
                    title: isAddPlaylistDisabled ? chrome.i18n.getMessage("noAddStreamWarning") : '',
                    onClick: function () {

                        if (!isAddPlaylistDisabled) {
                            StreamItems.addByPlaylist(self.model, false);
                        }

                    }
                }, {
                    text: chrome.i18n.getMessage("playPlaylistInStream"),
                    disabled: isPlayPlaylistDisabled,
                    title: isPlayPlaylistDisabled ? chrome.i18n.getMessage("noAddStreamWarning") : '',
                    onClick: function () {

                        if (!isPlayPlaylistDisabled) {
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
            var activeItem = this.$el.find('.playlistItem[data-playlistitemid="' + itemId + '"]');

            if (activeItem.length > 0) {
                activeItem.scrollIntoView(true);
            }
        }
        
    });

    return ActivePlaylistItemsView;
});