define([
    'text!template/playlistTitle.html'
], function (PlaylistTitleTemplate) {
    'use strict';

    var PlaylistTitleView = Backbone.Marionette.ItemView.extend({
        id: 'playlist-title',
        className: 'text-tooltipable playlist-title',
        template: _.template(PlaylistTitleTemplate),
        
        modelEvents: {
            'change:title': 'render'
        },
        
        behaviors: {
            Tooltip: {
            }
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