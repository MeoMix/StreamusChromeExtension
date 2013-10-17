define([
    'text!../template/createPlaylistPrompt.htm'
], function (CreatePlaylistPromptTemplate) {
    'use strict';

    var CreatePlaylistPromptView = Backbone.View.extend({

        className: 'modalOverlay reloadPrompt',

        template: _.template(CreatePlaylistPromptTemplate),

        panel: null,

        events: {
            'click .ok': 'createPlaylist',
        },

        render: function () {
            this.$el.html(this.template(
                _.extend({
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n
                })
            ));

            this.panel = this.$el.children('.panel');

            return this;
        },

        createPlaylist: function () {

            //  TODO: Create playlist with name

            this.$el.removeClass('visible').fadeOut();
        },
        

        fadeInAndShow: function () {
            var self = this;
            
            this.panel.fadeIn(200, function () {
                self.$el.addClass('visible');
            });
        }
        
    });

    return CreatePlaylistPromptView;
});