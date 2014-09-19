define([
    'text!template/editPlaylist.html'
], function (EditPlaylistTemplate) {
    'use strict';

    var EditPlaylistView = Backbone.Marionette.ItemView.extend({
        id: 'editPlaylist',
        template: _.template(EditPlaylistTemplate),
        
        templateHelpers: {
            requiredMessage: chrome.i18n.getMessage('required'),
            titleMessage: chrome.i18n.getMessage('title').toLowerCase()
        },
        
        ui: {
            playlistTitleInput: '#editPlaylist-playlistTitleInput'
        },

        events: {
            'input @playlistTitleInput': '_validateTitle'
        },
        
        onShow: function () {
            //  Reset val to prevent highlighting and just focus.
            this.ui.playlistTitle.focus().val(this.ui.playlistTitle.val());
        },
        
        validate: function () {
            var valid = this.$el.find('.js-submittable.is-invalid').length === 0;
            return valid;
        },
        
        _validateTitle: function () {
            //  When the user submits - check to see if they provided a playlist name
            var playlistTitle = $.trim(this.ui.playlistTitle.val());
            this.ui.playlistTitle.toggleClass('is-invalid', playlistTitle === '');
        },
        
        _doRenderedOk: function () {
            var playlistTitle = $.trim(this.ui.playlistTitle.val());
            this.model.set('title', playlistTitle);
        }
    });

    return EditPlaylistView;
});