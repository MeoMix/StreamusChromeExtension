define([
    'foreground/view/behavior/tooltip',
    'foreground/view/prompt/saveSongsPromptView',
    'text!template/saveToPlaylistButton.html'
], function (Tooltip, SaveSongsPromptView, SaveToPlaylistButtonTemplate) {
    'use strict';

    var User = chrome.extension.getBackgroundPage().User;

    var SaveToPlaylistButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'button',
        className: 'button-icon colored',
        template: _.template(SaveToPlaylistButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('cantSaveNotSignedIn')
        },

        events: {
            'click': '_saveToPlaylist',
            'dblclick': '_saveToPlaylist'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },

        onRender: function() {
            this._setTitleAndDisabled();
        },
        
        initialize: function () {
            this.listenTo(User, 'change:signedIn', this._setTitleAndDisabled);
        },

        _saveToPlaylist: _.debounce(function () {
            // Return false even on disabled button click so the click event does not bubble up and select the item. 
            if (!this.$el.hasClass('disabled')) {
                this._showSaveSongsPrompt();
            }

            //  Don't allow dblclick to bubble up to the list item and cause a play.
            return false;
        }, 100, true),
        
        _setTitleAndDisabled: function () {
            var signedIn = User.get('signedIn');

            var title = signedIn ? chrome.i18n.getMessage('save') : chrome.i18n.getMessage('cantSaveNotSignedIn');
            this.$el.attr('title', title).toggleClass('disabled', !signedIn);
        },
        
        _showSaveSongsPrompt: function() {
            window.Application.vent.trigger('showPrompt', new SaveSongsPromptView({
                songs: [this.model.get('song')]
            }));
        }
    });

    return SaveToPlaylistButtonView;
});