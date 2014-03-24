define([
    'foreground/view/mixin/titleTooltip',
    'text!template/playlistTitle.html'
], function (TitleTooltip, PlaylistTitleTemplate) {
    'use strict';

    var PlaylistTitleView = Backbone.Marionette.ItemView.extend(_.extend({}, TitleTooltip, {

        id: 'playlist-title',
        className: 'playlist-title',
        template: _.template(PlaylistTitleTemplate),
        
        modelEvents: {
            'change:title': 'render'
        },
        
        onShow: function() {
            this.setTitleTooltip(this.$el);
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