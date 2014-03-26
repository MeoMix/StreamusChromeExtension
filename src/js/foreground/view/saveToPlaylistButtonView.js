define([
    'background/model/user',
    'foreground/view/prompt/saveSourcesPromptView',
    'text!template/saveToPlaylistButton.html'
], function (User, SaveSourcesPromptView, SaveToPlaylistButtonTemplate) {
    'use strict';

    var SaveToPlaylistButtonView = Backbone.Marionette.ItemView.extend({
        
        tagName: 'button',
        className: 'button-icon colored',
        template: _.template(SaveToPlaylistButtonTemplate),
        
        attributes: {
            title: chrome.i18n.getMessage('cantSaveNotSignedIn')
        },

        events: {
            'click': 'saveToPlaylist',
            'dblclick': 'saveToPlaylist'
        },
        
        onShow: function () {
            //  Be sure to call render first or else setting content.text won't actually update it.
            this.$el.qtip('render');
            this.$el.qtip('option', 'content.text', this.$el.attr('title'));
        },
        
        onRender: function() {
            this.setTitleAndDisabled();
        },
        
        initialize: function () {
            this.listenTo(User, 'change:signedIn', this.setTitleAndDisabled);
            this.$el.qtip();
        },

        saveToPlaylist: _.debounce(function () {
            // Return false even on disabled button click so the click event does not bubble up and select the item. 
            if (!this.$el.hasClass('disabled')) {  
                var saveSourcesPromptView = new SaveSourcesPromptView({
                    videos: [this.model]
                });

                saveSourcesPromptView.fadeInAndShow();
            }

            //  Don't allow dblclick to bubble up to the list item and cause a play.
            return false;
        }, 100, true),
        
        setTitleAndDisabled: function () {
           
            var signedIn = User.get('signedIn');

            var title = signedIn ? chrome.i18n.getMessage('save') : chrome.i18n.getMessage('cantSaveNotSignedIn');
            this.$el.attr('title', title).toggleClass('disabled', !signedIn);
        }

    });

    return SaveToPlaylistButtonView;
});