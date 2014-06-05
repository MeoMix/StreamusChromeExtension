define([
    'foreground/view/mixin/titleTooltip',
    'text!template/playlistTitle.html'
], function (TitleTooltip, PlaylistTitleTemplate) {
    'use strict';

    var PlaylistTitleView = Backbone.Marionette.ItemView.extend(_.extend({}, TitleTooltip, {
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
    }));

    return PlaylistTitleView;
});