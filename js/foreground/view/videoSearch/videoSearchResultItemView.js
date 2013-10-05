define([
], function () {
    'use strict';

    var VideoSearchResultItemView = Backbone.View.extend({
        
        className: 'videoSearchResultItem',

        template: _.template($('#videoSearchResultItemTemplate').html()),
        
        attributes: function () {
            return {
                'data-videoid': this.model.get('id')
            };
        },
        
        events: {
            'click': 'select'
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.toggleClass('selected', this.model.get('selected'));


            this.$el.find('img.lazy').lazyload({
                effect: 'fadeIn',
                container: this.$el,
                event: 'scroll manualShow'
            });
            
            //  TODO: Trigger manual show?
            
            return this;
        },
        
        initialize: function () {
            this.listenTo(this.model, 'change:selected', this.render);
        },
        
        select: function() {
            console.log("Selecting!");

            this.model.set('selected', true);

            //var clickedItem = $(event.currentTarget);
            //var videoSearchResultItem = this.model.get(clickedItem.data('videoid'));

            //videoSearchResultItem.set('selected', true);
        }

    });

    return VideoSearchResultItemView;
});