define([
    'text!template/playlistTitle.html'
], function (PlaylistTitleTemplate) {
    'use strict';

    var PlaylistTitleView = Backbone.Marionette.ItemView.extend({

        id: 'playlistTitle',
        className: 'playlistTitle title',
        template: _.template(PlaylistTitleTemplate),
        
        modelEvents: {
            'change:title': 'render'
        },

        onRender: function () {
            this.setTitle();
            this.applyTooltips();
        },
        
        setTitle: function() {
            this.$el.attr('title', this.model.get('title'));
        }
        
    });

    return PlaylistTitleView;
});