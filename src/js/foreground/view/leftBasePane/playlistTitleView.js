define([
    'foreground/model/foregroundViewManager',
    'text!template/playlistTitle.html'
], function (ForegroundViewManager, PlaylistTitleTemplate) {
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

        initialize: function () {
            ForegroundViewManager.subscribe(this);
        },
        
        setTitle: function() {
            this.$el.attr('title', this.model.get('title'));
        }
        
    });

    return PlaylistTitleView;
});