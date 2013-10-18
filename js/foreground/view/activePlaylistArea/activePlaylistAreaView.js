define([
    'activePlaylistItemsView',
    'text!../template/activePlaylistArea.htm'
], function (ActivePlaylistItemsView, ActivePlaylistAreaTemplate) {
    'use strict';

    var ActivePlaylistAreaView = Backbone.View.extend({

        className: 'left-pane',
        
        template: _.template(ActivePlaylistAreaTemplate),
        
        activePlaylistItemsView: null,
        //playlistItemInputView: null,
        
        attributes: {
            id: 'activePlaylistArea'
        },
        
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            
            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n
                })
            ));

            this.$el.find('.left-top-divider').after(this.activePlaylistItemsView.render().el);

            return this;
        },

        initialize: function () {

            //  TODO: Do I have to set this in initialize or can I do it through the property?
            this.activePlaylistItemsView = new ActivePlaylistItemsView({
                model: this.model.get('playlist')
            });
            
            //this.playlistItemInputView = new PlaylistItemInputView({
            //    model: this.model
            //});
            
            //this.$el.prepend(this.playlistItemInputView.render().el);

        },
        
        show: function() {
            this.$el.fadeIn();
        },
        
        hide: function() {
            this.$el.fadeOut();
        }

    });

    return ActivePlaylistAreaView;
});