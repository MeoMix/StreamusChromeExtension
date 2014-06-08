define([
    'foreground/view/behavior/tooltip',
    'text!template/playlistTitle.html'
], function (Tooltip, PlaylistTitleTemplate) {
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
                behaviorClass: Tooltip
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