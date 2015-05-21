define(function(require) {
    'use strict';

    var PlaylistActions = require('foreground/model/playlist/playlistActions');
    var ListItemButton = require('foreground/view/behavior/listItemButton');
    var DeleteListItemButtonTemplate = require('text!template/listItemButton/deleteListItemButton.html');
    var DeleteIconTemplate = require('text!template/icon/deleteIcon_18.svg');

    var DeletePlaylistButtonView = Marionette.ItemView.extend({
        template: _.template(DeleteListItemButtonTemplate),
        templateHelpers: {
            deleteIcon: _.template(DeleteIconTemplate)()
        },

        attributes: {
            'data-tooltip-text': chrome.i18n.getMessage('delete')
        },

        behaviors: {
            ListItemButton: {
                behaviorClass: ListItemButton
            }
        },

        playlist: null,

        initialize: function(options) {
            this.playlist = options.playlist;
            this._setState();

            //  Ensure that the user isn't able to destroy the model more than once.
            this._deletePlaylist = _.once(this._deletePlaylist);
        },

        onClick: function() {
            this._deletePlaylist();
        },

        _deletePlaylist: function() {
            var playlistActions = new PlaylistActions();

            playlistActions.deletePlaylist(this.playlist);
        },

        _setState: function() {
            var canDelete = this.playlist.get('canDelete');

            var tooltipText;
            if (canDelete) {
                tooltipText = chrome.i18n.getMessage('delete');
            } else {
                tooltipText = chrome.i18n.getMessage('cantDeleteLastPlaylist');
            }

            this.$el.toggleClass('is-disabled', !canDelete).attr('data-tooltip-text', tooltipText);
            this.model.set('enabled', canDelete);
        }
    });

    return DeletePlaylistButtonView;
});