define([
    'videoSearchResultItemView'
], function (VideoSearchResultItemView) {
    'use strict';

    var VideoSearchResultsView = Backbone.View.extend({
        className: 'left-list',
        
        template: _.template($('#videoSearchResultsTemplate').html()),
        
        attributes: {
            id: 'searchResultsList'
        },
        
        render: function () {

            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n,
                    'VideoSearchResultItemView': VideoSearchResultItemView
                })
            ));

            this.addAll();
            
            this.$el.find('img.lazy').lazyload({
                effect: 'fadeIn',
                container: this.$el,
                event: 'scroll manualShow'
            });

            return this;
        },
        
        initialize: function (options) {

            if (!options.parent) throw "VideoSearchResultsView expects to be initialized with a parent ActivePlaylist";
            this.parent = options.parent;

            this.listenTo(this.model, 'reset', this.render);
            //this.listenTo(this.model, 'all', this.render);
        },
        
        addOne: function (videoSearchResultItem) {
            var videoSearchResultItemView = new VideoSearchResultItemView({
                model: videoSearchResultItem
            });
            
            this.$el.append(videoSearchResultItemView.render().el);
        },
        
        addAll: function () {
            this.model.each(this.addOne, this);
        },
        
        addItemToActivePlaylist: function (event) {

            var clickedItem = $(event.currentTarget);

            var videoSearchResultItem = this.model.get(clickedItem.data('videoid'));
            var videoInformation = videoSearchResultItem.get('videoInformation');

            //  TODO: It feels a bit sloppy to have to reference this through the parent.model -- what happens when I want to drag n drop to the stream?
            this.parent.model.get('relatedPlaylist').addItemByInformation(videoInformation, function () {
                console.log("success");
            });

        }
    });

    return VideoSearchResultsView;
});