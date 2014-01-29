//  Represents the playlist items in a given playlist
define([
    'foreground/view/multiSelectView',
    'foreground/collection/contextMenuGroups',
    'foreground/collection/streamItems',
    'foreground/view/activePlaylistArea/playlistItemView',
    'text!template/activePlaylistItems.html'
], function (MultiSelectView, ContextMenuGroups, StreamItems, PlaylistItemView, ActivePlaylistItemsTemplate) {
    'use strict';

    var ActivePlaylistItemsView = MultiSelectView.extend({
        
        className: 'left-list droppable-list',

        template: _.template(ActivePlaylistItemsTemplate),
        
        events: function(){
            return _.extend({}, MultiSelectView.prototype.events, {
                'contextmenu': 'showContextMenu'
            });
        },
        
        attributes: {
            'id': 'activePlaylistItems'
        },
            
        render: function () {

            this.$el.html(this.template());

            //  Group playlistItems into chunks of 200 to render incrementally to prevent long-running operations.
            var chunkSize = 200;
            var playlistItemChunks = _.toArray(this.model.groupBy(function (playlistItem, index) {
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
            
            MultiSelectView.prototype.render.call(this, arguments);
            
            return this;
        },
        
        initialize: function() {
            this.listenTo(this.model, 'add', this.addItem);
            
            this.listenTo(this.model, 'remove', function () {
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

                var currentItemIndex = this.model.indexOf(playlistItem);

                var previousItem = this.model.at(currentItemIndex - 1);
                    
                if (previousItem) {
                    var previousItemId = previousItem.get('id');

                    var previousItemElement = this.$el.find('.playlistItem[data-id="' + previousItemId + '"]');
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

                var self = this;
            
                var isPlaylistEmpty = this.model.length === 0;

                ContextMenuGroups.add({

                    items: [{
                        text: chrome.i18n.getMessage('enqueuePlaylist'),
                        disabled: isPlaylistEmpty,
                        title: isPlaylistEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                        onClick: function () {

                            if (!isPlaylistEmpty) {
                                StreamItems.addByPlaylistItems(self.model, false);
                            }

                        }
                    }, {
                        text: chrome.i18n.getMessage('playPlaylist'),
                        disabled: isPlaylistEmpty,
                        title: isPlaylistEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                        onClick: function () {

                            if (!isPlaylistEmpty) {
                                StreamItems.addByPlaylistItems(self.model, true);
                            }

                        }
                    }]
                });
                
            }


        },
        
        scrollItemIntoView: function(item) {
            var itemId = item.get('id');
            var activeItem = this.$el.find('.listItem[data-id="' + itemId + '"]');

            if (activeItem.length > 0) {
                activeItem.scrollIntoView(true);
            }
        }

    });

    return ActivePlaylistItemsView;
});