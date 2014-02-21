define([
    'foreground/model/foregroundViewManager',
    'text!template/playlistTitle.html'
], function (ForegroundViewManager, PlaylistTitleTemplate) {
    'use strict';

    var PlaylistTitleView = Backbone.Marionette.ItemView.extend({

        id: 'playlistTitle',
        className: 'playlistTitle title',
        template: _.template(PlaylistTitleTemplate),
        
        attributes: function() {
            return {
                title: this.model.get('title')
            };
        },

        ui: {
            playlistTitle: ''
        }, 
        
        modelEvents: {
            'change:title': 'render'
        },

        onRender: function () {            
            this.applyTooltips();
        },

        initialize: function () {
            ForegroundViewManager.subscribe(this);
        }
        
        //updatePlaylistTitle: function () {
        //    var playlistTitle = this.model.get('title');
        //    this.text(playlistTitle);
            
        //    //  TODO: Can I just call applyTooltips here instead? It would be better for checking overflowing of new title right?
        //    this.ui.playlistTitle.qtip('option', 'content.text', playlistTitle);
        //}
        
    });

    return PlaylistTitleView;
});