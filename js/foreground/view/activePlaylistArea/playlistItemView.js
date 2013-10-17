define([
    'text!../template/playlistItem.htm'
], function (PlaylistItemTemplate) {
    'use strict';

    var PlaylistItemView = Backbone.View.extend({
        className: 'playlistItem',
        
        template: _.template(PlaylistItemTemplate),
        
        attributes: function() {
            return {
                'data-playlistitemid': this.model.get('id')
            };
        },
        
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.remove);
        }

    });

    return PlaylistItemView;
});