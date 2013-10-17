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
            'contextmenu .playlistItem': 'showItemContextMenu',
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

                this.$el.find('img.lazy').lazyload({
                    effect: 'fadeIn',
                    container: this.$el,
                    event: 'scroll manualShow'
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

            this.startListeningToItems(this.model.get('items'));

            Utility.scrollChildElements(this.el, 'span.playlistItemTitle');
        },
        
        changeModel: function(newModel) {
          
            this.stopListening(this.model.get('items'));

            this.model = newModel;
            this.startListeningToItems(newModel.get('items'));

            this.render();
        },

        startListeningToItems: function (playlistItems) {
            this.listenTo(playlistItems, 'add', this.addItem);
            this.listenTo(playlistItems, 'empty', this.render);
            this.listenTo(playlistItems, 'remove', function () {
                //  Trigger a manual show because an item could slide into view and need to load it.
                this.$el.trigger('manualShow');
            });
        },
        
        addItem: function (playlistItem) {

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
            
            element.find('img.lazy').lazyload({
                effect: 'fadeIn',
                container: this.$el,
                event: 'scroll manualShow'
            });

            this.scrollItemIntoView(playlistItem);
        },
        
        showContextMenu: function (event) {

            event.preventDefault();
            ContextMenuGroups.reset();

            var self = this;

            var isAddPlaylistDisabled = this.model.get('items').length === 0;

            ContextMenuGroups.add({
                position: 0,
                items: [{
                    position: 0,
                    text: chrome.i18n.getMessage("addPlaylistToStream"),
                    disabled: isAddPlaylistDisabled,
                    title: isAddPlaylistDisabled ? chrome.i18n.getMessage("addPlaylistNoAddStreamWarning") : '',
                    onClick: function () {

                        if (!isAddPlaylistDisabled) {
                            
                            var streamItems = self.model.get('items').map(function (playlistItem) {
                                return {
                                    id: _.uniqueId('streamItem_'),
                                    video: playlistItem.get('video'),
                                    title: playlistItem.get('title')
                                };
                            });

                            StreamItems.addMultiple(streamItems);
                            
                        }

                    }
                }]
            });

        },
        
        showItemContextMenu: function (event) {

            event.preventDefault();
            ContextMenuGroups.reset();
            
            var clickedPlaylistItemId = $(event.currentTarget).data('playlistitemid');
            var clickedPlaylistItem = this.model.get('items').get(clickedPlaylistItemId);

            var self = this;
            ContextMenuGroups.add({
                position: 0,
                items: [{
                    position: 0,
                    text: chrome.i18n.getMessage("copyUrl"),
                    onClick: function () {
                        chrome.extension.sendMessage({
                            method: 'copy',
                            text: 'http://youtu.be/' + clickedPlaylistItem.get('video').get('id')
                        });
                    }
                }, {
                    position: 1,
                    text: chrome.i18n.getMessage("copyTitleAndUrl"),
                    onClick: function () {

                        chrome.extension.sendMessage({
                            method: 'copy',
                            text: '"' + clickedPlaylistItem.get('title') + '" - http://youtu.be/' + clickedPlaylistItem.get('video').get('id')
                        });
                    }
                }, {
                    position: 2,
                    text: chrome.i18n.getMessage("deleteVideo"),
                    onClick: function () {
                        clickedPlaylistItem.destroy();
                    }
                }, {
                    position: 3,
                    text: chrome.i18n.getMessage("addVideoToStream"),
                    onClick: function () {
                        StreamItems.add({
                            id: _.uniqueId('streamItem_'),
                            video: clickedPlaylistItem.get('video'),
                            title: clickedPlaylistItem.get('title')
                        });
                    }
                }]

            });

            ContextMenuGroups.add({
                position: 1,
                items: [{
                    position: 0,
                    text: chrome.i18n.getMessage("addPlaylistToStream"),
                    onClick: function () {

                        var streamItems = self.model.get('items').map(function (playlistItem) {
                            return {
                                id: _.uniqueId('streamItem_'),
                                video: playlistItem.get('video'),
                                title: playlistItem.get('title')
                            };
                        });

                        StreamItems.addMultiple(streamItems);

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