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
            id: 'playlists'
        },
        
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

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

        changeModel: function (newModel) {
            this.model = newModel;

            //  TODO: Destroy and re-create the view instead of calling changeModel.
            this.activePlaylistItemsView.changeModel(newModel);
            //this.playlistItemInputView.changeModel(newModel);
        }

    });

    return ActivePlaylistAreaView;
});