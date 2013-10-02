define([
], function () {
    'use strict';

    var VideoSearchResultsView = Backbone.View.extend({
        className: 'left-list',
        
        template: _.template($('#videoSearchResultsTemplate').html()),
        
        attributes: {
            id: 'searchResultsList'
        },
        
        events: {
            'click .videoSearchResultItem': 'addItemToActivePlaylist'
        },
        
        render: function () {

            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n
                })
            ));
            
            this.$el.find('img.lazy').lazyload({
                effect: 'fadeIn',
                container: this.$el,
                event: 'scroll manualShow'
            });

            return this;
        },
        
        initialize: function () {
            this.listenTo(this.model, 'reset', this.render);
        },
        
        addItemToActivePlaylist: function (event) {

            var clickedItem = $(event.target);

            var videoSearchResultItem = this.model.get(clickedItem.data('videoid'));
            
            

        }
    });

    return VideoSearchResultsView;
});