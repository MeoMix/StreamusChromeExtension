define([
    'text!template/playlistTitle.html'
], function (PlaylistTitleTemplate) {
    'use strict';

    var PlaylistTitleView = Backbone.Marionette.ItemView.extend({

        id: 'playlist-title',
        className: 'playlist-title title',
        template: _.template(PlaylistTitleTemplate),
        
        modelEvents: {
            'change:title': 'render'
        },
        
        onShow: function() {
            this.applyTooltips();
        },
        
        onRender: function () {
            this.setTitle();
        },
        
        setTitle: function() {
            this.$el.attr('title', this.model.get('title'));
        }
        
    });

    return PlaylistTitleView;
});