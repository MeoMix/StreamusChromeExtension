//  Represents the videos in a given playlist
define([
    'contextMenuGroups',
    'streamItems',
    'playlistItemView',
    'text!../template/activePlaylistItems.htm',
    'utility',
    'playlistAction'
], function (ContextMenuGroups, StreamItems, PlaylistItemView, ActivePlaylistItemsTemplate, Utility, PlaylistAction) {
    'use strict';

    var ActivePlaylistItemsView = Backbone.View.extend({
        
        className: 'left-list',

        template: _.template(ActivePlaylistItemsTemplate),
        
        events: {
            'contextmenu': 'showContextMenu',
            'click .playlistItem': 'addItemToStream'
        },
        
        attributes: {
            'id': 'activePlaylistItemsView'
        },
            
        render: function () {
            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n
                })
            ));

            var firstItemId = this.model.get('firstItemId');

            var playlistItems = this.model.get('items');
            
            if (playlistItems.length > 0) {

                var playlistItem = playlistItems.get(firstItemId);

                console.log("this.model and playlistItem:", this.model, playlistItem);

                //  Build up the views for each playlistItem.
                var items = [];
                do {

                    var playlistItemView = new PlaylistItemView({
                        model: playlistItem
                    });

                    var element = playlistItemView.render().el;
                    items.push(element);

                    var nextItemId = playlistItem.get('nextItemId');
                    playlistItem = playlistItems.get(nextItemId);

                } while (playlistItem && playlistItem.get('id') !== firstItemId)

                //  Do this all in one DOM insertion to prevent lag in large playlists.
                this.$el.append(items);

                var self = this;
                setTimeout(function () {
                    
                    self.$el.find('img.lazy').lazyload({
                        container: self.$el,
                        event: 'scroll manualShow'
                    });
                    
                });

            }

            return this;
        },
        
        initialize: function() {

            var self = this;
            
            //  Allows for drag-and-drop of videos
            this.$el.sortable({
                axis: 'y',
                //  Adding this helps prevent unwanted clicks to play
                delay: 100,
                cancel: '.big-text',
                //  Whenever a video row is moved inform the Player of the new video list order
                update: function (event, ui) {

                    var newIndex = ui.item.index();
                    var nextIndex = newIndex + 1;

                    console.log("self == this?", self == this);

                    var nextItem = self.$el.find('item:eq(' + nextIndex + ')');

                    if (nextItem == null) {
                        nextItem = self.$el.find('item:eq(0)');
                    }
                    
                    var movedPlaylistItemId = ui.item.data('playlistitemid');
                    var nextPlaylistItemId = nextItem.data('playlistitemid');

                    self.model.moveItem(movedPlaylistItemId, nextPlaylistItemId);
                }
            });

            this.listenTo(this.model.get('items'), 'add', this.addItem);
            
            this.listenTo(this.model.get('items'), 'empty', this.render);
            this.listenTo(this.model.get('items'), 'remove', function () {
                //  Trigger a manual show because an item could slide into view and need to load it.
                console.log("Triggering manual show");
                this.$el.trigger('manualShow');
            });

            
            Utility.scrollChildElements(this.el, 'span.item-title');
        },

        addItem: function (playlistItem) {

            console.log("addItem is being called with item:", playlistItem);

            var playlistItemView = new PlaylistItemView({
                model: playlistItem
            });

            console.log("Added playlistItem:", playlistItem);

            var element = playlistItemView.render().$el;

            if (this.$el.find('item').length > 0) {

                var previousItemId = playlistItem.get('previousItemId');

                var previousItem = this.$el.find('item[data-playlistitemid="' + previousItemId + '"]');
                element.insertAfter(previousItem);

            } else {

                //  TODO: Not very good practice to remove it like this.
                $('.big-text').remove();

                element.appendTo(this.$el);
            }

            var self = this;

            element.find('img.lazy').lazyload({
                effect: 'fadeIn',
                container: self.$el,
                event: 'scroll manualShow'
            });
                
            self.scrollItemIntoView(playlistItem);
            
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
                            PlaylistAction.addToStream(self.model);
                        }

                    }
                }, {
                    text: chrome.i18n.getMessage("playPlaylistInStream"),
                    disabled: isPlayPlaylistDisabled,
                    title: isPlayPlaylistDisabled ? chrome.i18n.getMessage("noAddStreamWarning") : '',
                    onClick: function () {

                        if (!isPlayPlaylistDisabled) {
                            PlaylistAction.addToStreamAndPlay(self.model);
                        }

                    }
                }]
            });

        },
        
        addItemToStream: function (event) {
            
            //  Add item to stream on dblclick.
            var playlistItemId = $(event.currentTarget).data('playlistitemid');
            var playlistItem = this.model.getPlaylistItemById(playlistItemId);

            StreamItems.add({
                id: _.uniqueId('streamItem_'),
                video: playlistItem.get('video'),
                title: playlistItem.get('title')
            });
            
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