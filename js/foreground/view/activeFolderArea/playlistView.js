define([
    'text!../template/playlist.htm'
], function (PlaylistTemplate) {
    'use strict';

    var PlaylistView = Backbone.View.extend({
        tagName: 'li',

        className: 'playlist',

        template: _.template(PlaylistTemplate),

        attributes: function () {
            return {
                'data-playlistid': this.model.get('id')
            };
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        initialize: function () {
            this.listenTo(this.model, 'change:title', this.render);
            this.listenTo(this.model, 'destroy', this.remove);

            this.listenTo(this.model.get('items'), 'add remove', this.render);
        }

    });

    return PlaylistView;
});