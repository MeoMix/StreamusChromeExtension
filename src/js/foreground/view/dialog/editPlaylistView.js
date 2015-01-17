define(function (require) {
    'use strict';

    var DialogContentView = require('foreground/view/dialog/dialogContentView');
    var EditPlaylistTemplate = require('text!template/dialog/editPlaylist.html');

    var EditPlaylistView = DialogContentView.extend({
        id: 'editPlaylist',
        template: _.template(EditPlaylistTemplate),
        //  TODO: Not DRY w/ CreatePlaylistView -- pull from DB?
        titleMaxLength: 150,

        templateHelpers: function () {
            return {
                titleMessage: chrome.i18n.getMessage('title'),
                titleMaxLength: this.titleMaxLength
            };
        },
        
        ui: function () {
            return {
                title: '#' + this.id + '-title',
                titleCharacterCount: '#' + this.id + '-title-characterCount'
            };
        },

        events: {
            'input @ui.title': '_onInputTitle'
        },
        
        onRender: function () {
            this._setTitleCharacterCount();
        },
        
        onShow: function () {
            this._focusInput();
        },
     
        editPlaylist: function () {
            var trimmedTitle = this._getTrimmedTitle();
            this.model.set('title', trimmedTitle);
        },
        
        _setTitleCharacterCount: function () {
            var trimmedTitle = this._getTrimmedTitle();
            this.ui.titleCharacterCount.text(trimmedTitle.length);
        },
        
        _onInputTitle: function () {
            this._setTitleCharacterCount();
            this._validateTitle();
        },
        
        _focusInput: function () {
            //  Reset val to prevent text from becoming highlighted.
            this.ui.title.focus().val(this.ui.title.val());
        },
        
        _validateTitle: function () {
            //  When the user submits - check to see if they provided a playlist name
            var trimmedTitle = this._getTrimmedTitle();
            this.ui.title.toggleClass('is-invalid', trimmedTitle === '');
        },
        
        _getTrimmedTitle: function() {
            return this.ui.title.val().trim();
        }
    });

    return EditPlaylistView;
});