define([
    'common/enum/listItemType',
    'foreground/collection/contextMenuItems',
    'foreground/view/addToStreamButtonView',
    'foreground/view/deleteButtonView',
    'foreground/view/multiSelectListItemView',
    'foreground/view/playInStreamButtonView',
    'text!template/listItem.html'
], function (ListItemType, ContextMenuItems, AddToStreamButtonView, DeleteButtonView, MultiSelectListItemView, PlayInStreamButtonView, ListItemTemplate) {
    'use strict';

    var StreamItems = chrome.extension.getBackgroundPage().StreamItems;

    var PlaylistItemView = MultiSelectListItemView.extend({
        className: MultiSelectListItemView.prototype.className + ' playlist-item',

        template: _.template(ListItemTemplate),

        attributes: function () {
            return {
                'data-id': this.model.get('id'),
                'data-type': ListItemType.PlaylistItem
            };
        },

        events: _.extend({}, MultiSelectListItemView.prototype.events, {
            'dblclick': 'playInStream'
        }),
        
        buttonViews: [PlayInStreamButtonView, AddToStreamButtonView, DeleteButtonView],
        
        showContextMenu: function(event) {
            event.preventDefault();

            var self = this;

            ContextMenuItems.reset([{
                        text: chrome.i18n.getMessage('copyUrl'),
                        onClick: function() {
                            chrome.extension.sendMessage({
                                method: 'copy',
                                text: self.model.get('song').get('url')
                            });
                        }
                    }, {
                        text: chrome.i18n.getMessage('copyTitleAndUrl'),
                        onClick: function() {
                            chrome.extension.sendMessage({
                                method: 'copy',
                                text: '"' + self.model.get('title') + '" - ' + self.model.get('song').get('url')
                            });
                        }
                    }, {
                        text: chrome.i18n.getMessage('deleteSong'),
                        onClick: function() {
                            self.model.destroy();
                        }
                    }, {
                        text: chrome.i18n.getMessage('add'),
                        onClick: function() {
                            StreamItems.addSongs(self.model.get('song'));
                        }
                    }, {
                        text: chrome.i18n.getMessage('play'),
                        onClick: function() {
                            StreamItems.addSongs(self.model.get('song'), {
                                playOnAdd: true
                            });
                        }
                    }, {
                        text: chrome.i18n.getMessage('watchOnYouTube'),
                        onClick: function() {
                            chrome.tabs.create({
                                url: self.model.get('song').get('url')
                            });
                        }
                    }]
            );

        },
        
        playInStream: function () {
            StreamItems.addSongs(this.model.get('song'), {
                playOnAdd: true
            });
        }
    });

    return PlaylistItemView;
});