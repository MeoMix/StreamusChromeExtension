define([
    'text!template/prompt/editPlaylist.html'
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
            'input @ui.playlistTitleInput': '_validateTitle'
        },
        
        onShow: function () {
            this._focusInput();
        },
     
        editPlaylist: function () {
            var trimmedTitle = this._getTrimmedTitle();
            this.model.set('title', trimmedTitle);
        },
        
        _focusInput: function () {
            //  Reset val to prevent text from becoming highlighted.
            this.ui.playlistTitleInput.focus().val(this.ui.playlistTitleInput.val());
        },
        
        _validateTitle: function () {
            //  When the user submits - check to see if they provided a playlist name
            var trimmedTitle = this._getTrimmedTitle();
            this.ui.playlistTitleInput.toggleClass('is-invalid', trimmedTitle === '');
        },
        
        _getTrimmedTitle: function() {
            return this.ui.playlistTitleInput.val().trim();
        }
    });

    return EditPlaylistView;
});