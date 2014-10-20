define([
    'foreground/view/listItemButton/listItemButtonView',
    'foreground/view/prompt/saveSongsPromptView',
    'text!template/listItemButton/saveListItemButton.html'
], function (ListItemButtonView, SaveSongsPromptView, SaveListItemButtonTemplate) {
    'use strict';

    var SaveSongButtonView = ListItemButtonView.extend({
        template: _.template(SaveListItemButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('cantSaveNotSignedIn')
        },
        
        signInManager: null,

        initialize: function () {
            this.signInManager = Streamus.backgroundPage.SignInManager;
            this.listenTo(this.signInManager, 'change:signedInUser', this._setDisabledState);
        },

        onRender: function() {
            this._setDisabledState();
        },

        doOnClickAction: function () {
            Streamus.channels.prompt.commands.trigger('show:prompt', SaveSongsPromptView, {
                songs: [this.model.get('song')]
            });
        },
        
        _setDisabledState: function () {
            var signedIn = this.signInManager.get('signedInUser') !== null;

            var title = signedIn ? chrome.i18n.getMessage('save') : chrome.i18n.getMessage('cantSaveNotSignedIn');
            this.$el.attr('title', title).toggleClass('disabled', !signedIn);
        }
    });

    return SaveSongButtonView;
});