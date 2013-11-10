define([
    'text!../template/playlist.htm'
], function (PlaylistTemplate) {
    'use strict';

    var PlaylistView = Backbone.View.extend({
        tagName: 'li',

        className: 'playlist',

        template: _.template(PlaylistTemplate),
        
        itemCount: null,

        attributes: function () {
            return {
                'data-playlistid': this.model.get('id')
            };
        },
        
        events: {
            'click': 'select'
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            this.$el.toggleClass('loading', this.model.has('dataSource') && !this.model.get('dataSourceLoaded'));
            this.$el.toggleClass('selected', this.model.get('active'));

            this.itemCount = this.$el.find('.count');

            return this;
        },

        initialize: function () {
            this.listenTo(this.model, 'change:title change:dataSourceLoaded change:active', this.render);
            this.listenTo(this.model, 'destroy', this.remove);

            this.listenTo(this.model.get('items'), 'add remove', this.updateItemCount);
        },
        
        updateItemCount: function() {
            this.itemCount.text(this.model.get('items').length);
        },
        
        select: function() {
            this.model.set('active', true);
        }

    });

    return PlaylistView;
});