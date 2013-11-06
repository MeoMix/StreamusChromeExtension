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
            'id': 'activePlaylistItemsView'
        },
            
        render: function () {
            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n
                })
            ));

            //var firstItemId = this.model.get('firstItemId');
            //  TODO: Do I even need to check length anymore?
            var playlistItems = this.model.get('items');
            
            if (playlistItems.length > 0) {

                //var playlistItem = playlistItems.get(firstItemId);

                //console.log("this.model and playlistItem:", this.model, playlistItem);

                //  Build up the views for each playlistItem.

                console.log("Items:", playlistItems);
                var items = playlistItems.map(function(playlistItem) {
                    var playlistItemView = new PlaylistItemView({
                        model: playlistItem
                    });
                    
                    return playlistItemView.render().el;
                });
                //do {

                //    var playlistItemView = new PlaylistItemView({
                //        model: playlistItem
                //    });

                //    var element = playlistItemView.render().el;
                //    items.push(element);

                //    var nextItemId = playlistItem.get('nextItemId');
                //    playlistItem = playlistItems.get(nextItemId);

                //} while (playlistItem && playlistItem.get('id') !== firstItemId)
                

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

        addItem: function (playlistItem) {

            console.log("addItem is being called with item:", playlistItem);

            var playlistItemView = new PlaylistItemView({
                model: playlistItem
            });

            console.log("Added playlistItem:", playlistItem);

            var element = playlistItemView.render().$el;

            if (this.$el.find('item').length > 0) {

                var playlistItems = this.model.get('items').get('items');
                
                var previousItemId = playlistItems.at(playlistItems.length - 1).get('id');

                //var previousItemId = playlistItem.get('previousItemId');

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