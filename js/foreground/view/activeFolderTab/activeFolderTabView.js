define([
    'activeFolderView',
    'playlistInputView'
], function (ActiveFolderView, PlaylistInputView) {
    'use strict';

    var ActiveFolderTabView = Backbone.View.extend({
        
        el: $('#PlaylistsContent'),
            
        activeFolderView: null,
        playlistInputView: null,
        
        initialize: function() {

            //  TODO: Do I have to set this in initialize or can I do it through the property?
            this.activeFolderView = new ActiveFolderView({
                model: this.model
            });
            
            this.playlistInputView = new PlaylistInputView({
                model: this.model
            });

            this.$el.prepend(this.playlistInputView.render().el);
        },
        
        changeModel: function(newModel) {
            this.model = newModel;
            
            //  TODO: Destroy and re-create the view instead of calling changeModel.
            this.activeFolderView.changeModel(newModel);
            this.playlistInputView.model = newModel;
        }


    });

    return ActiveFolderTabView;
});