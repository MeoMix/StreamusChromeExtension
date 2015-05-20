define(function() {
    'use strict';

    var ContextMenuAction = Backbone.Model.extend({
        defaults: {
            song: null,
            player: null
        },

        showContextMenu: function(top, left) {
            Streamus.channels.simpleMenu.commands.trigger('show:simpleMenu', {
                isContextMenu: true,
                top: top,
                left: left,
                simpleMenuItems: [{
                    text: chrome.i18n.getMessage('copyUrl'),
                    onClick: this._copyUrl.bind(this)
                }, {
                    text: chrome.i18n.getMessage('copyTitleAndUrl'),
                    onClick: this._copyTitleAndUrl.bind(this)
                }, {
                    text: chrome.i18n.getMessage('watchOnYouTube'),
                    onClick: this._watchOnYouTube.bind(this)
                }]
            });
        },

        _copyUrl: function() {
            this.get('song').copyUrl();
        },

        _copyTitleAndUrl: function() {
            this.get('song').copyTitleAndUrl();
        },

        _watchOnYouTube: function() {
            this.get('player').watchInTab(this.get('song'));
        }
    });

    return ContextMenuAction;
});