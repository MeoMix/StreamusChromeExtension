//  Represents the videos in a given playlist
define([
    'contextMenuView',
    'streamItems',
    'playlistItemView',
    'utility'
], function (ContextMenuView, StreamItems, PlaylistItemView, Utility) {
    'use strict';

    var ActivePlaylistView = Backbone.View.extend({
        
        el: $('#ActivePlaylistView'),
        
        ul: $('#ActivePlaylistView ul'),
        
        emptyNotification: $('#ActivePlaylistView .emptyListNotification'),
        
        events: {
            'contextmenu': 'showContextMenu',
            'contextmenu ul li': 'showItemContextMenu',
            'click ul li': 'addItemToStream'
        },
        
        render: function () {
            this.ul.empty();

            var activePlaylist = this.model;

            if (activePlaylist.get('items').length === 0) {
                this.emptyNotification.show();
            } else {
                this.emptyNotification.hide();

                var firstItemId = activePlaylist.get('firstItemId');
                var playlistItem = activePlaylist.get('items').get(firstItemId);

                //  Build up the ul of li's representing each playlistItem.
                var listItems = [];
                do {

                    var playlistItemView = new PlaylistItemView({
                        model: playlistItem
                    });

                    var element = playlistItemView.render().el;
                    listItems.push(element);

                    var nextItemId = playlistItem.get('nextItemId');
                    playlistItem = activePlaylist.get('items').get(nextItemId);

                } while (playlistItem && playlistItem.get('id') !== firstItemId)

                //  Do this all in one DOM insertion to prevent lag in large playlists.
                this.ul.append(listItems);
            }

            this.$el.find('img.lazy').lazyload({
                effect : 'fadeIn',
                container: this.$el,
                event: 'scroll manualShow'
            });

            return this;
        },
        
        initialize: function() {

            var self = this;
            
            this.emptyNotification.text(chrome.i18n.getMessage("emptyPlaylist"));
            
            //  Need to do it this way to support i18n
            this.emptyNotification.css({
                'margin-left': (-1 * this.emptyNotification.width() / 2) + $('#menu').width()
            });
            
            //  Allows for drag-and-drop of videos
            this.ul.sortable({
                axis: 'y',
                //  Adding this helps prevent unwanted clicks to play
                delay: 100,
                //  Whenever a video row is moved inform the Player of the new video list order
                update: function (event, ui) {

                    var movedItemId = ui.item.data('itemid');
                    var newIndex = ui.item.index();
                    var nextIndex = newIndex + 1;

                    var nextListItem = self.ul.children('ul li:eq(' + nextIndex + ')');

                    if (nextListItem == null) {
                        nextListItem = self.ul.children('ul li:eq(0)');
                    }

                    var nextItemId = nextListItem.data('itemid');

                    self.model.moveItem(movedItemId, nextItemId);
                }
            });

            this.startListeningToItems(this.model.get('items'));
            this.render();

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
        },
        
        addItem: function (playlistItem) {

            var playlistItemView = new PlaylistItemView({
                model: playlistItem
            });

            var element = playlistItemView.render().$el;

            if (this.ul.find('li').length > 0) {

                var previousItemId = playlistItem.get('previousItemId');

                var previousItemLi = this.ul.find('li[data-itemid="' + previousItemId + '"]');
                element.insertAfter(previousItemLi);

            } else {
                element.appendTo(this.ul);
            }
            
            element.find('img.lazy').lazyload({
                effect: 'fadeIn',
                container: this.$el,
                event: 'scroll manualShow'
            });

            this.emptyNotification.hide();
            this.scrollItemIntoView(playlistItem);
        },
        
        showContextMenu: function (event) {
            var self = this;
            
            var isAddPlaylistDisabled = this.model.get('items').length === 0;

            ContextMenuView.addGroup({
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
                                    title: playlistItem.get('title'),
                                    videoImageUrl: 'http://img.youtube.com/vi/' + playlistItem.get('video').get('id') + '/default.jpg'
                                };
                            });

                            StreamItems.addMultiple(streamItems);
                            
                        }

                    }
                }]
            });

            ContextMenuView.show({
                top: event.pageY,
                left: event.pageX + 1
            });

            return false;
        },
        
        showItemContextMenu: function (event) {

            var clickedItemId = $(event.currentTarget).data('itemid');
            var clickedItem = this.model.get('items').get(clickedItemId);

            var self = this;
            ContextMenuView.addGroup({
                position: 0,
                items: [{
                    position: 0,
                    text: chrome.i18n.getMessage("copyUrl"),
                    onClick: function () {
                        chrome.extension.sendMessage({
                            method: 'copy',
                            text: 'http://youtu.be/' + clickedItem.get('video').get('id')
                        });
                    }
                }, {
                    position: 1,
                    text: chrome.i18n.getMessage("copyTitleAndUrl"),
                    onClick: function () {

                        chrome.extension.sendMessage({
                            method: 'copy',
                            text: '"' + clickedItem.get('title') + '" - http://youtu.be/' + clickedItem.get('video').get('id')
                        });
                    }
                }, {
                    position: 2,
                    text: chrome.i18n.getMessage("deleteVideo"),
                    onClick: function () {
                        clickedItem.destroy();
                    }
                }, {
                    position: 3,
                    text: chrome.i18n.getMessage("addVideoToStream"),
                    onClick: function () {
                        StreamItems.add({
                            id: _.uniqueId('streamItem_'),
                            video: clickedItem.get('video'),
                            title: clickedItem.get('title'),
                            videoImageUrl: 'http://img.youtube.com/vi/' + clickedItem.get('video').get('id') + '/default.jpg'
                        });
                    }
                }]
            });

            ContextMenuView.addGroup({
                position: 1,
                items: [{
                    position: 0,
                    text: chrome.i18n.getMessage("addPlaylistToStream"),
                    onClick: function () {

                        var streamItems = self.model.get('items').map(function (playlistItem) {
                            return {
                                id: _.uniqueId('streamItem_'),
                                video: playlistItem.get('video'),
                                title: playlistItem.get('title'),
                                videoImageUrl: 'http://img.youtube.com/vi/' + playlistItem.get('video').get('id') + '/default.jpg'
                            };
                        });

                        StreamItems.addMultiple(streamItems);

                    }
                }]
            });

            ContextMenuView.show({
                top: event.pageY,
                left: event.pageX + 1
            });

            return false;
            
        },
        
        addItemToStream: function (event) {
            
            //  Add item to stream on dblclick.
            var itemId = $(event.currentTarget).data('itemid');
            var playlistItem = this.model.getPlaylistItemById(itemId);

            StreamItems.add({
                id: _.uniqueId('streamItem_'),
                video: playlistItem.get('video'),
                title: playlistItem.get('title'),
                videoImageUrl: 'http://img.youtube.com/vi/' + playlistItem.get('video').get('id') + '/default.jpg'
            });
            
        },
        
        scrollItemIntoView: function(item) {
            var itemId = item.get('id');
            var activeItem = this.ul.find('li[data-itemid="' + itemId + '"]');

            if (activeItem.length > 0) {
                activeItem.scrollIntoView(true);
            }
        }
        
    });

    return ActivePlaylistView;
});