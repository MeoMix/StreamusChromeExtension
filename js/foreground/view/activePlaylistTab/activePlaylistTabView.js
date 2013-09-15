define([
    'activePlaylistView',
    'playlistItemInputView'
], function (ActivePlaylistView, PlaylistItemInputView) {
    'use strict';

    var ActivePlaylistTabView = Backbone.View.extend({

        el: $('#HomeContent'),
        
        activePlaylistView: null,
        playlistItemInputView: null,

        initialize: function () {

            //  TODO: Do I have to set this in initialize or can I do it through the property?
            this.activePlaylistView = new ActivePlaylistView({
                model: this.model
            });

            this.playlistItemInputView = new PlaylistItemInputView({
                model: this.model
            });
            
            this.$el.prepend(this.playlistItemInputView.render().el);

        },

        changeModel: function (newModel) {
            this.model = newModel;

            //  TODO: Destroy and re-create the view instead of calling changeModel.
            this.activePlaylistView.changeModel(newModel);
            this.playlistItemInputView.changeModel(newModel);
        }

    });

    return ActivePlaylistTabView;
});