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
        
        index: -1,
        
        events: {
            'click': 'toggleSelected'
        },

        render: function () {

            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    //  Mix in chrome to reference internationalize.
                    'index': this.index
                })
            ));

            this.setHighlight();
            
            return this;
        },
        
        initialize: function (options) {

            this.index = options.index;

            this.listenTo(this.model, 'change:selected', this.setHighlight);
        },
        
        setHighlight: function () {
            this.$el.toggleClass('selected', this.model.get('selected'));
        },
        
        toggleSelected: function () {

            //  A dragged model must always be selected.
            var selected = !this.model.get('selected') || this.model.get('dragging');

            this.model.set('selected', selected);

        }
    });

    return VideoSearchResultItemView;
});