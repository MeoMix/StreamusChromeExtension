define([
    'foreground/view/genericForegroundView',
    'foreground/model/foregroundViewManager',
    'text!template/stream.html',
    'foreground/view/rightPane/stream/repeatButtonView',
    'foreground/view/rightPane/stream/shuffleButtonView',
    'foreground/view/rightPane/stream/radioButtonView',
    'foreground/view/rightPane/stream/saveStreamButtonView',
    'foreground/collection/contextMenuGroups',
    'enum/listItemType',
    'foreground/model/streamAction',
    'foreground/view/rightPane/stream/streamItemView',
    'foreground/collection/folders',
    'foreground/collection/videoSearchResults',
    'foreground/model/lazyLoader',
    'foreground/mixin/unwrappedRegionMixin'
], function (GenericForegroundView, ForegroundViewManager, StreamTemplate, RepeatButtonView, ShuffleButtonView, RadioButtonView, SaveStreamButtonView, ContextMenuGroups, ListItemType, StreamAction, StreamItemView, Folders, VideoSearchResults, LazyLoader, UnwrappedRegionMixin) {
    'use strict';
    
    //  TODO: I think this is actually only a CollectionView.
    var StreamView = Backbone.Marionette.CompositeView.extend({
        
        template: _.template(StreamTemplate),
        itemViewContainer: '#streamItems',

        itemView: StreamItemView,
        
        shown: false,
        
        events: {
            'contextmenu @ui.streamItems': 'showContextMenu',
            'click button#clearStream': 'clear'
        },
        
        ui: {
            'streamEmptyMessage': '.streamEmpty',
            'contextButtons': '.context-buttons',
            'streamItems': '#streamItems'
        },
        
        onAfterItemAdded: function (viewInstance) {
            if (this.shown) {
                LazyLoader.showOrSubscribe(this.ui.streamItems, viewInstance.ui.imageThumbnail);
            }
        },

        onItemRemoved: function (viewInstance) {
            LazyLoader.unsubscribe(this.ui.streamItems, viewInstance.ui.imageThumbnail);
        },
        
        onShow: function () {

            var imageThumbnails = this.children.map(function (child) {
                return child.ui.imageThumbnail;
            });

            //  TODO: onShow should guarantee that offset/height is defined already, but I think because this is a Chrome extension
            //  the fact that the extension is still opening up prevents these from being defined?
            setTimeout(function() {
                LazyLoader.showOrSubscribe(this.ui.streamItems, imageThumbnails);
                this.shown = true;
            }.bind(this));
        },
        
        onRender: function () {

            this.$el.find('#saveStreamButtonView').replaceWith((new SaveStreamButtonView()).render().el);
            this.$el.find('#shuffleButtonView').replaceWith((new ShuffleButtonView()).render().el);
            this.$el.find('#repeatButtonView').replaceWith((new RepeatButtonView()).render().el);
            this.$el.find('#radioButtonView').replaceWith((new RadioButtonView()).render().el);
           
            this.toggleBigText();
            this.toggleContextButtons();
            
            if (this.collection.selected().length > 0) {
                this.$el.find('.listItem.selected').scrollIntoView(false);
                this.$el.trigger('scroll');
            }

            var self = this;

            this.$el.find(this.itemViewContainer).sortable({

                connectWith: '.droppable-list',

                cursorAt: {
                    right: 35,
                    bottom: 40
                },

                placeholder: 'sortable-placeholder listItem hiddenUntilChange',

                helper: function (ui, streamItem) {

                    //  Create a new view instead of just copying the HTML in order to preserve HTML->Backbone.View relationship
                    var copyHelperView = new StreamItemView({
                        model: self.collection.get(streamItem.data('id')),
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
                    var draggedStreamItem = self.collection.get(streamItemId);
                    //  TODO: Standardize getActivePlaylist on either Folder or Playlists.
                    var videoAlreadyExists = Folders.getActiveFolder().getActivePlaylist().get('items').videoAlreadyExists(draggedStreamItem.get('video'));

                    ui.placeholder.toggleClass('noDrop', videoAlreadyExists);

                    ui.item.data('sortableItem').scrollParent = ui.placeholder.parent();
                    ui.item.data('sortableItem').overflowOffset = ui.placeholder.parent().offset();
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

                    var listItemType = ui.item.data('type');

                    if (listItemType === ListItemType.PlaylistItem) {
                        var activePlaylistItems = Folders.getActiveFolder().getActivePlaylist().get('items');

                        var draggedPlaylistItems = activePlaylistItems.selected();
                        self.collection.addByDraggedPlaylistItems(draggedPlaylistItems, ui.item.index());

                        activePlaylistItems.deselectAll();
                    } else if (listItemType === ListItemType.VideoSearchResult) {
                        var draggedSearchResults = VideoSearchResults.selected();

                        self.collection.addByDraggedVideoSearchResults(draggedSearchResults, ui.item.index());
                        VideoSearchResults.deselectAll();
                    }

                    ui.item.remove();
                    ui.sender.data('copied', true);

                    return false;
                },
                update: function (event, ui) {
                    var listItemType = ui.item.data('type');

                    //  Don't run this code when handling playlist items -- only when reorganizing stream items.
                    if (listItemType === ListItemType.StreamItem) {

                        //  It's important to do this to make sure I don't count my helper elements in index.
                        var newIndex = parseInt(ui.item.parent().children('.listItem').index(ui.item));

                        var streamItemId = ui.item.data('id');
                        var currentIndex = self.collection.indexOf(self.collection.get(streamItemId));
                        self.collection.models.splice(newIndex, 0, self.collection.models.splice(currentIndex, 1)[0]);

                        //  TODO: Something better than this... would be nice to actually be sorting.. again lends itself
                        //  to using the sequencedCollection for client-side collections, too.
                        self.collection.trigger('sort');
                    }
                },

                over: function (event, ui) {
                    ui.item.data('sortableItem').scrollParent = ui.placeholder.parent();
                    ui.item.data('sortableItem').overflowOffset = ui.placeholder.parent().offset();
                }
            });

            console.log("I AM RENDERED");

        },
        
        collectionEvents: {
            'add remove reset': function() {
                this.toggleBigText();
                this.toggleContextButtons();
                
                //  Trigger a scroll event because an item could slide into view and lazy loading would need to happen.
                this.$el.trigger('scroll');
            },
            'change:selected': function () {
                //  TODO: Do I need to use a selector here? I don't believe it!
                var selectedListItemElement = this.$el.find('.listItem.selected');

                if (selectedListItemElement.length === 1) {
                    selectedListItemElement.scrollIntoView(true);
                }

                this.$el.trigger('scroll');
            }
        },
        
        initialize: function() {
            ForegroundViewManager.subscribe(this);
        },
        
        //  TODO: Do this the marionette way.
        //  Hide the empty message if there is anything in the collection
        toggleBigText: function () {
            this.ui.streamEmptyMessage.toggleClass('hidden', this.collection.length > 0);
        },
        
        //  Show buttons if there is anything in the collection otherwise hide
        toggleContextButtons: function () {
            this.ui.contextButtons.toggle(this.collection.length > 0);
        },
        
        showContextMenu: function (event) {

            //  Whenever a context menu is shown -- set preventDefault to true to let foreground know to not reset the context menu.
            event.preventDefault();

            if (event.target === event.currentTarget) {
                //  Didn't bubble up from a child -- clear groups.
                ContextMenuGroups.reset();
            }

            var isStreamEmpty = this.collection.length === 0;

            ContextMenuGroups.add({
                items: [{
                    text: chrome.i18n.getMessage('clearStream'),
                    title: isStreamEmpty ? chrome.i18n.getMessage('streamEmpty') : '',
                    disabled: isStreamEmpty,
                    onClick: function () {
                        StreamAction.clearStream();
                    }
                }, {
                    text: chrome.i18n.getMessage('saveStream'),
                    title: isStreamEmpty ? chrome.i18n.getMessage('streamEmpty') : '',
                    disabled: isStreamEmpty,
                    onClick: function () {
                        StreamAction.saveStream();
                    }
                }]
            });

        },

        appendHtml: function (collectionView, itemView, index) {
            var childrenContainer = collectionView.itemViewContainer ? collectionView.$(collectionView.itemViewContainer) : collectionView.$el;
            var children = childrenContainer.children();
            if (children.size() <= index) {
                childrenContainer.append(itemView.el);
            } else {
                children.eq(index).before(itemView.el);
            }
        },
        
        clear: function() {
            StreamAction.clearStream();
        }

    });

    _.extend(StreamView, UnwrappedRegionMixin);

    return StreamView;
});