define([
    'foreground/view/listItemButtonView',
    'foreground/view/prompt/saveSongsPromptView',
    'text!template/saveToPlaylistButton.html'
], function (ListItemButtonView, SaveSongsPromptView, SaveToPlaylistButtonTemplate) {
    'use strict';

    var SignInManager = Streamus.backgroundPage.SignInManager;

    var SaveToPlaylistButtonView = ListItemButtonView.extend({
        template: _.template(SaveToPlaylistButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('cantSaveNotSignedIn')
        },

        events: {
            'click': '_saveToPlaylist',
            'dblclick': '_saveToPlaylist'
        },

        initialize: function () {
            this.listenTo(SignInManager, 'change:signedIn', this._setTitleAndDisabledClass);
        },

        onRender: function() {
            this._setTitleAndDisabledClass();
        },

        _saveToPlaylist: _.debounce(function () {
            // Return false even on disabled button click so the click event does not bubble up and select the item. 
            if (!this.$el.hasClass('disabled')) {
                this._showSaveSongsPrompt();
            }

            //  Don't allow dblclick to bubble up to the list item and cause a play.
            return false;
        }, 100, true),
        
        _setTitleAndDisabledClass: function () {
            var signedIn = SignInManager.get('signedIn');

            var title = signedIn ? chrome.i18n.getMessage('save') : chrome.i18n.getMessage('cantSaveNotSignedIn');
            this.$el.attr('title', title).toggleClass('disabled', !signedIn);
        },
        
        _showSaveSongsPrompt: function() {
            Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', SaveSongsPromptView, {
                songs: [this.model.get('song')]
            });
        }
    });

    return SaveToPlaylistButtonView;
});