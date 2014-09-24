define([
    'foreground/view/listItemButton/listItemButtonView',
    'foreground/view/prompt/saveSongsPromptView',
    'text!template/listItemButton/saveListItemButton.html'
], function (ListItemButtonView, SaveSongsPromptView, SaveListItemButtonTemplate) {
    'use strict';

    var SignInManager = Streamus.backgroundPage.SignInManager;

    var SaveSongButtonView = ListItemButtonView.extend({
        template: _.template(SaveListItemButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('cantSaveNotSignedIn')
        },

        initialize: function () {
            this.listenTo(SignInManager, 'change:signedIn', this._setDisabledState);
        },

        onRender: function() {
            this._setDisabledState();
        },

        doOnClickAction: function () {
            Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', SaveSongsPromptView, {
                songs: [this.model.get('song')]
            });
        },
        
        _setDisabledState: function () {
            var signedIn = SignInManager.get('signedIn');

            var title = signedIn ? chrome.i18n.getMessage('save') : chrome.i18n.getMessage('cantSaveNotSignedIn');
            this.$el.attr('title', title).toggleClass('disabled', !signedIn);
        }
    });

    return SaveSongButtonView;
});