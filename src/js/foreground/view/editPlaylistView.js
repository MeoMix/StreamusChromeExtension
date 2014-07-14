define([
    'text!template/editPlaylist.html'
], function (EditPlaylistTemplate) {
    'use strict';

    var EditPlaylistView = Backbone.Marionette.ItemView.extend({
        className: 'edit-playlist',
        template: _.template(EditPlaylistTemplate),
        
        ui: {
            playlistTitle: 'input[type="text"]'
        },

        events: {
            'input.playlist-title': 'validateTitle'
        },
        
        templateHelpers: {
            requiredMessage: chrome.i18n.getMessage('required'),
            titleMessage: chrome.i18n.getMessage('title').toLowerCase()
        },
        
        onShow: function () {
            //  Reset val to prevent highlighting and just focus.
            this.ui.playlistTitle.focus().val(this.ui.playlistTitle.val());
        },
        
        validateTitle: function () {
            //  When the user submits - check to see if they provided a playlist name
            var playlistTitle = $.trim(this.ui.playlistTitle.val());
            this.ui.playlistTitle.toggleClass('invalid', playlistTitle === '');
        },

        validate: function() {
            var valid = this.$el.find('.submittable.invalid').length === 0;
            return valid;
        },
        
        doRenderedOk: function () {
            var playlistTitle = $.trim(this.ui.playlistTitle.val());
            this.model.set('title', playlistTitle);
        }
    });

    return EditPlaylistView;
});