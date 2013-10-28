define([
    'text!../template/playlistItem.htm',
    'contextMenuGroups'
], function (PlaylistItemTemplate, ContextMenuGroups) {
    'use strict';

    var PlaylistItemView = Backbone.View.extend({
        className: 'playlistItem',
        
        template: _.template(PlaylistItemTemplate),
        
        attributes: function() {
            return {
                'data-playlistitemid': this.model.get('id')
            };
        },
        
        events: {
            'contextmenu': 'showContextMenu'
        },
        
        render: function () {
            
            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n
                })
            ));
            
            return this;
        },
        
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.remove);
        },

        showContextMenu: function (event) {

            var self = this;

            event.preventDefault();
            ContextMenuGroups.reset();
        
            ContextMenuGroups.add({
                items: [{
                    text: chrome.i18n.getMessage("copyUrl"),
                    onClick: function () {
                        chrome.extension.sendMessage({
                            method: 'copy',
                            text: 'http://youtu.be/' + self.model.get('video').get('id')
                        });
                    }
                }, {
                    text: chrome.i18n.getMessage("copyTitleAndUrl"),
                    onClick: function () {

                        chrome.extension.sendMessage({
                            method: 'copy',
                            text: '"' + self.model.get('title') + '" - http://youtu.be/' + self.model.get('video').get('id')
                        });
                    }
                }, {
                    text: chrome.i18n.getMessage("deleteVideo"),
                    onClick: function () {
                        self.model.destroy();
                    }
                }, {
                    text: chrome.i18n.getMessage("addVideoToStream"),
                    onClick: function () {
                        StreamItems.add({
                            id: _.uniqueId('streamItem_'),
                            video: self.model.get('video'),
                            title: self.model.get('title')
                        });
                    }
                }]

            });

        },

    });

    return PlaylistItemView;
});