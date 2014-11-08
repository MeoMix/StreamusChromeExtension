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
            playlistTitle: '#editPlaylist-playlistTitle'
        },

        events: {
            'input @ui.playlistTitle': '_onInputPlaylistTitle'
        },
        
        onShow: function () {
            this._focusInput();
        },
     
        editPlaylist: function () {
            var trimmedTitle = this._getTrimmedTitle();
            this.model.set('title', trimmedTitle);
        },
        
        _onInputPlaylistTitle: function () {
            this._validateTitle();
        },
        
        _focusInput: function () {
            //  Reset val to prevent text from becoming highlighted.
            this.ui.playlistTitle.focus().val(this.ui.playlistTitle.val());
        },
        
        _validateTitle: function () {
            //  When the user submits - check to see if they provided a playlist name
            var trimmedTitle = this._getTrimmedTitle();
            this.ui.playlistTitle.toggleClass('is-invalid', trimmedTitle === '');
        },
        
        _getTrimmedTitle: function() {
            return this.ui.playlistTitle.val().trim();
        }
    });

    return EditPlaylistView;
});