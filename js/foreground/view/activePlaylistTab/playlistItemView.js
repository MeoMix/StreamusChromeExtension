define(function () {
    'use strict';

    var PlaylistItemView = Backbone.View.extend({
        className: 'playlistItem',
        
        template: _.template($('#playlistItemTemplate').html()),
        
        attributes: function() {
            return {
                //  TODO: Probably renamed this to playlistitemid to avoid confusion with listitem's id.
                'data-itemid': this.model.get('id')
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