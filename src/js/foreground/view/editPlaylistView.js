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
            this._focusInput();
        },
        
        validate: function () {
            var valid = this.$el.find('.js-submittable.is-invalid').length === 0;
            return valid;
        },
        
        _focusInput: function () {
            //  Reset val to prevent text from becoming highlighted.
            this.ui.playlistTitleInput.focus().val(this.ui.playlistTitleInput.val());
        },
        
        _validateTitle: function () {
            //  When the user submits - check to see if they provided a playlist name
            var playlistTitle = $.trim(this.ui.playlistTitleInput.val());
            this.ui.playlistTitle.toggleClass('is-invalid', playlistTitle === '');
        },
        
        _doRenderedOk: function () {
            var playlistTitle = $.trim(this.ui.playlistTitleInput.val());
            this.model.set('title', playlistTitle);
        }
    });

    return EditPlaylistView;
});