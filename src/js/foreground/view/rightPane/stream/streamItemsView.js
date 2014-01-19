define([
    'foreground/view/genericForegroundView',
    'foreground/collection/streamItems',
    'foreground/view/rightPane/stream/streamItemView',
    'text!template/streamItems.html',
    'foreground/collection/contextMenuGroups',
    'common/model/utility',
    'foreground/model/streamAction',
    'foreground/collection/folders',
    'foreground/collection/videoSearchResults',
    'enum/listItemType'
], function (GenericForegroundView, StreamItems, StreamItemView, StreamItemsTemplate, ContextMenuGroups, Utility, StreamAction, Folders, VideoSearchResults, ListItemType) {
    'use strict';
    
    var StreamItemsView = GenericForegroundView.extend({
        //  TODO: Change all left-list to just list.
        className: 'left-list droppable-list',
        
        attributes: {
            'id': 'streamItemList'
        },

        template: _.template(StreamItemsTemplate),
        
        events: {
            'contextmenu': 'showContextMenu'
        },
        
        render: function () {
            
            this.$el.html(this.template());
        
            if (StreamItems.length > 0) {
                
                if (StreamItems.length === 1) {
                    this.addItem(StreamItems.at(0));
                } else {
                    this.addItems(StreamItems.models);
                }
                
                var streamItems = this.$el.find('.listItem');
                var selectedStreamItem = streamItems.filter('.selected');

                //  It's important to wrap scrollIntoView with a setTimeout because if streamView's element has not been
                //  appended to the DOM yet -- scrollIntoView will not have an effect. Letting the stack clear resolves this.
                setTimeout(function () {
                    selectedStreamItem.scrollIntoView(false);
                    this.$el.trigger('scroll');
                }.bind(this));
  
            }

            return this;
        },

        initialize: function () {

            //  Whenever an item is added to the collection, visually add an item, too.
            this.listenTo(StreamItems, 'add', this.addItem);
            this.listenTo(StreamItems, 'addMultiple', this.addItems);

            this.listenTo(StreamItems, 'remove reset', function () {
                //  Trigger a scroll event because an item could slide into view and lazy loading would need to happen.
                this.$el.trigger('scroll');
                
                //  TODO: Is this OK and not a memory leak? Why don't the stream items clean up after themselves??
                if (StreamItems.length === 0) {
                    this.emptyStreamItemList();
                }

            });

            this.listenTo(StreamItems, 'change:selected', function () {

                var selectedListItemElement = this.$el.find('.listItem.selected');
                
                if (selectedListItemElement.length === 1) {
                    selectedListItemElement.scrollIntoView(true);
                }

                this.$el.trigger('scroll');
            });


            this.$el.sortable({

                connectWith: '.droppable-list',
                
                cursorAt: {
                    right: 35,
                    bottom: 40
                },
                
                //  Adding this helps prevent unwanted clicks to play
                delay: 100,
                
                placeholder: "sortable-placeholder listItem hiddenUntilChange",

                helper: function (ui, streamItem) {
                    
                    //  Create a new view instead of just copying the HTML in order to preserve HTML->Backbone.View relationship
                    var copyHelperView = new StreamItemView({
                        model: StreamItems.get(streamItem.data('id')),
                        //  Don't lazy-load the view because copy helper is clearly visible
                        instant: true
                    });

                    this.copyHelper = copyHelperView.render().$el.insertAfter(streamItem);
                    this.copyHelper.css({
                        opacity: '.5'
                    }).addClass('copyHelper');

                    this.backCopyHelper = streamItem.prev();
                    this.backCopyHelper.addClass('copyHelper');

                    $(this).data('copied', false);

                    return $('<span>', {
                        'class': 'selectedModelsLength',
                        'text': '1'
                    });
                },
                
                change: function () {
                    //  There's a CSS redraw issue with my CSS selector: .listItem.copyHelper + .sortable-placeholder 
                    //  So, I manually hide the placehelper (like it would be normally) until a change occurs -- then the CSS can take over.
                    $('.hiddenUntilChange').removeClass('hiddenUntilChange');
                },
                start: function (event, ui) {
                    var streamItemId = ui.item.data('id');
                    
                    //  Color the placeholder to indicate that the StreamItem can't be copied into the Playlist.
                    var draggedStreamItem = StreamItems.get(streamItemId);
                    //  TODO: Standardize getActivePlaylist on either Folder or Playlists.
                    var itemAlreadyExists = Folders.getActiveFolder().getActivePlaylist().get('items').itemAlreadyExists(draggedStreamItem);

                    ui.placeholder.toggleClass('noDrop', itemAlreadyExists);
                },
                stop: function () {
                    this.backCopyHelper.removeClass('copyHelper');

                    var copied = $(this).data('copied');
                    if (copied) {
                        this.copyHelper.css({
                            opacity: 1
                        }).removeClass('copyHelper');
                    }
                    else {
                        this.copyHelper.remove();
                    }

                    this.copyHelper = null;
                    this.backCopyHelper = null;

                },
                tolerance: 'pointer',
                receive: function (event, ui) {

                    var index = parseInt(ui.item.index());
    
                    var listItemType = ui.item.data('type');

                    if (listItemType === ListItemType.PlaylistItem) {
                        var activePlaylistItems = Folders.getActiveFolder().getActivePlaylist().get('items');

                        var draggedPlaylistItems = activePlaylistItems.selected();
                        StreamItems.addByDraggedPlaylistItems(draggedPlaylistItems, index);
                        
                        activePlaylistItems.deselectAll();
                    } else if(listItemType === ListItemType.VideoSearchResult) {
                        var draggedSearchResults = VideoSearchResults.selected();

                        StreamItems.addByDraggedVideoSearchResults(draggedSearchResults, index);
                        VideoSearchResults.deselectAll();
                    }

                    ui.item.remove();
                    ui.sender.data('copied', true);
                },
                update: function (event, ui) {
                    var listItemType = ui.item.data('type');

                    //  Don't run this code when handling playlist items -- only when reorganizing stream items.
                    if (listItemType === ListItemType.StreamItem) {
             
                        //  It's important to do this to make sure I don't count my helper elements in index.
                        var newIndex = parseInt(ui.item.parent().children('.listItem').index(ui.item));
                        
                        var streamItemId = ui.item.data('id');
                        var currentIndex = StreamItems.indexOf(StreamItems.get(streamItemId));
                        StreamItems.models.splice(newIndex, 0, StreamItems.models.splice(currentIndex, 1)[0]);
                        
                        //  TODO: Something better than this... would be nice to actually be sorting.. again lends itself
                        //  to using the sequencedCollection for client-side collections, too.
                        StreamItems.trigger('sort');
                    }
                },
                
                over: function (event, ui) {
                    ui.item.data('sortableItem').scrollParent = ui.placeholder.parent();
                    ui.item.data('sortableItem').overflowOffset = ui.placeholder.parent().offset();
                }
            });

        },
        
        addItem: function (streamItem) {

            var streamItemView = new StreamItemView({
                model: streamItem
            });

            var index = StreamItems.indexOf(streamItem);

            var element = streamItemView.render().el;

            this.addElementsToStream(element, index);
            
            //  TODO: Maybe I should scroll to it always? Or show some msg saying it added?
            if (streamItem.get('selected')) {
                streamItemView.$el.scrollIntoView();
            }

        },
        
        addItems: function (streamItems) {

            var streamItemViews = _.map(streamItems, function(streamItem) {

                return new StreamItemView({
                    model: streamItem
                });

            });

            var elements = _.map(streamItemViews, function (streamItemView) {
                return streamItemView.render().el;
            });

            this.addElementsToStream(elements);

            var selectedStreamItem = _.find(streamItems, function(streamItem) {
                return streamItem.get('selected') === true;
            });
            
            var selectedView = _.findWhere(streamItemViews, { model: selectedStreamItem });
            
            if (selectedView !== undefined) {
                selectedView.$el.scrollIntoView();
            }

        },
        
        addElementsToStream: function (elements, index) {

            if (index !== undefined) {

                var previousStreamItem = this.$el.children().eq(index);

                if (previousStreamItem.length > 0) {
                    previousStreamItem.after(elements);
                } else {
                    this.$el.append(elements);
                }
                
            } else {
                this.$el.append(elements);
            }

            //  TODO: This seems overly verbose...
            //  The image needs a second to be setup. Wrapping in a setTimeout causes lazyload to work properly.
            setTimeout(function () {

                if (_.isArray(elements)) {
                    var elementsInViewport = _.filter(elements, function (element) {
                        return $.inviewport(element, { threshold: 0, container: this.el });
                    }.bind(this));

                    var elementsNotInViewport = _.filter(elements, function (element) {
                        return !$.inviewport(element, { threshold: 0, container: this.el });
                    }.bind(this));

                    $(elementsInViewport).find('img.lazy').lazyload({
                        container: this.el
                    });

                    $(elementsNotInViewport).find('img.lazy').lazyload({
                        effect: 'fadeIn',
                        threshold: 500,
                        container: this.el
                    });
                } else {
                    var isInViewport = $.inviewport(elements, { threshold: 0, container: this.el });
                    $(elements).find('img.lazy').lazyload({
                        effect: isInViewport ? undefined : 'fadeIn',
                        threshold: 500,
                        container: this.el
                    });
                }

            }.bind(this));
            
        },
        
        showContextMenu: function (event) {

            //  Whenever a context menu is shown -- set preventDefault to true to let foreground know to not reset the context menu.
            event.preventDefault();

            if (event.target === event.currentTarget) {
                //  Didn't bubble up from a child -- clear groups.
                ContextMenuGroups.reset();
            }
            
            var isStreamEmpty = StreamItems.length === 0;

            ContextMenuGroups.add({
                items: [{
                    text: chrome.i18n.getMessage('clearStream'),
                    title: isStreamEmpty ? chrome.i18n.getMessage('streamEmpty') : '',
                    disabled: isStreamEmpty,
                    onClick: function() {
                        StreamAction.clearStream();
                    }
                }, {
                    text: chrome.i18n.getMessage('saveStream'),
                    title: isStreamEmpty ? chrome.i18n.getMessage('streamEmpty') : '',
                    disabled: isStreamEmpty,
                    onClick: function() {
                        StreamAction.saveStream();
                    }
                }]
            });

        },
        
        emptyStreamItemList: function() {
            this.$el.find('.streamItem').remove();
        }

    });

    return StreamItemsView;
});