define(function (require) {
    'use strict';

    var ContextMenuAction = Backbone.Model.extend({
        defaults: {
            song: null,
            player: null
        },

        showContextMenu: function() {
            Streamus.channels.contextMenu.commands.trigger('reset:items', [{
                text: chrome.i18n.getMessage('copyUrl'),
                onClick: this._copyUrl.bind(this)
            }, {
                text: chrome.i18n.getMessage('copyTitleAndUrl'),
                onClick: this._copyTitleAndUrl.bind(this)
            }, {
                text: chrome.i18n.getMessage('watchOnYouTube'),
                onClick: this._watchOnYouTube.bind(this)
            }]);
        },

        _copyUrl: function () {
            this.get('song').copyUrl();
        },

        _copyTitleAndUrl: function () {
            this.get('song').copyTitleAndUrl();
        },

        _watchOnYouTube: function () {
            this.get('player').watchInTab(this.get('song'));
        }
    });

    return ContextMenuAction;
});