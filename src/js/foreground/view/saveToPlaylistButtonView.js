define([
    'text!template/saveToPlaylistButton.html',
    'foreground/view/prompt/saveVideosPromptView',
    'background/model/user'
], function (SaveToPlaylistButtonTemplate, SaveVideosPromptView, User) {
    'use strict';

    var SaveToPlaylistButtonView = Backbone.Marionette.ItemView.extend({
        
        tagName: 'button',
        className: 'button-icon colored',
        template: _.template(SaveToPlaylistButtonTemplate),

        events: {
            'click': 'saveToPlaylist',
            'dblclick': 'saveToPlaylist'
        },
        
        onShow: function () {
            //  Apply tooltips only in onShow to ensure that the element is fully constructed and visible, else qtip might act up.
            this.applyTooltips();
        },
        
        onRender: function() {
            this.setTitleAndDisabled();
        },
        
        initialize: function () {
            this.listenTo(User, 'change:signedIn', this.setTitleAndDisabled);
        },

        saveToPlaylist: _.debounce(function () {
            // Return false even on disabled button click so the click event does not bubble up and select the item. 
            if (!this.$el.hasClass('disabled')) {  
                var saveVideosPromptView = new SaveVideosPromptView({
                    videos: [this.model]
                });

                saveVideosPromptView.fadeInAndShow();
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