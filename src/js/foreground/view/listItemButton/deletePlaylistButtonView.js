define(function(require) {
    'use strict';

    var PlaylistAction = require('foreground/model/playlist/playlistAction');
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

        initialize: function() {
            this._setState();

            //  Ensure that the user isn't able to destroy the model more than once.
            this.doOnClickAction = _.once(this.doOnClickAction);
        },

        doOnClickAction: function() {
            var playlistAction = new PlaylistAction({
                playlist: this.model
            });

            playlistAction.deletePlaylist();
        },

        _setState: function() {
            var canDelete = this.model.get('canDelete');

            var tooltipText;
            if (canDelete) {
                tooltipText = chrome.i18n.getMessage('delete');
            } else {
                tooltipText = chrome.i18n.getMessage('cantDeleteLastPlaylist');
            }

            this.$el.toggleClass('is-disabled', !canDelete).attr('data-tooltip-text', tooltipText);
        }
    });

    return DeletePlaylistButtonView;
});