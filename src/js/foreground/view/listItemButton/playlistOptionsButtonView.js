define(function(require) {
    'use strict';

    var ListItemButton = require('foreground/view/behavior/listItemButton');
    var PlaylistActions = require('foreground/model/playlist/playlistActions');
    var OptionsListItemButtonTemplate = require('text!template/listItemButton/optionsListItemButton.html');
    var OptionsIconTemplate = require('text!template/icon/optionsIcon_18.svg');

    var PlaylistOptionsButtonView = Marionette.ItemView.extend({
        template: _.template(OptionsListItemButtonTemplate),
        templateHelpers: {
            optionsIcon: _.template(OptionsIconTemplate)()
        },

        attributes: {
            'data-tooltip-text': chrome.i18n.getMessage('moreOptions')
        },

        behaviors: {
            ListItemButton: {
                behaviorClass: ListItemButton
            }
        },

        playlist: null,

        initialize: function(options) {
            this.playlist = options.playlist;
        },

        onClick: function() {
            var offset = this.$el.offset();
            var playlistActions = new PlaylistActions();
            playlistActions.showContextMenu(this.playlist, offset.top, offset.left);
        }
    });

    return PlaylistOptionsButtonView;
});