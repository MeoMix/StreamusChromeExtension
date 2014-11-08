define([
    'foreground/view/listItemButton/listItemButtonView',
    'foreground/view/prompt/saveSongsPromptView',
    'text!template/listItemButton/saveListItemButton.html'
], function (ListItemButtonView, SaveSongsPromptView, SaveListItemButtonTemplate) {
    'use strict';

    var SaveSongButtonView = ListItemButtonView.extend({
        template: _.template(SaveListItemButtonTemplate),

        signInManager: null,

        initialize: function () {
            this.signInManager = Streamus.backgroundPage.signInManager;
            this.listenTo(this.signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);
            
            ListItemButtonView.prototype.initialize.apply(this, arguments);
        },

        onRender: function() {
            this._setState();
        },

        doOnClickAction: function () {
            Streamus.channels.prompt.commands.trigger('show:prompt', SaveSongsPromptView, {
                songs: [this.model.get('song')]
            });
        },
        
        _onSignInManagerChangeSignedInUser: function() {
            this._setState();
        },
        
        _setState: function () {
            var signedIn = this.signInManager.get('signedInUser') !== null;

            var title = signedIn ? chrome.i18n.getMessage('save') : chrome.i18n.getMessage('notSignedIn');
            this.$el.attr('title', title).toggleClass('disabled', !signedIn);
        }
    });

    return SaveSongButtonView;
});