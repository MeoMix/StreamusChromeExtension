define([
    'text!../template/addSearchResults.htm',
    'streamItems',
    'videoSearchResults'
], function (AddSearchResultsTemplate, StreamItems, VideoSearchResults) {
    'use strict';

    var AddSearchResultsView = Backbone.View.extend({

        template: _.template(AddSearchResultsTemplate),
        
        attributes: {
            'id': 'addItems'
        },
        
        events: {
            'click #hideAddItemsButton': 'destroyModel'
        },
        
        streamItemsLength: null,
        resetStateTimeout: null,

        render: function () {

            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    //  Mix in chrome to reference internationalize.
                    'streamItemsLength': StreamItems.length
                })
            ));

            this.$el.find('i.droppable').droppable({
                hoverClass: 'icon-drop-hover',
                tolerance: 'pointer',
                drop: function (event, ui) {

                    var draggedVideoId = ui.draggable.data('videoid');
                    var videoSearchResult = VideoSearchResults.get(draggedVideoId);

                    StreamItems.addByVideoInformation(videoSearchResult.get('videoInformation'));

                    var streamItemIcon = $(this);
                    var checkIcon = streamItemIcon.next();

                    checkIcon.removeClass('hidden');
                    streamItemIcon.addClass('hidden');

                    clearTimeout(this.resetStateTimeout);

                    this.resetStateTimeout = setTimeout(function() {
                        streamItemIcon.removeClass('hidden');
                        checkIcon.addClass('hidden');
                    }, 2500);

                }
            });

            this.itemCount = this.$el.find('span.item-count');

            return this;
        },
        
        initialize: function() {
            this.listenTo(StreamItems, 'add remove', this.updateStreamItemsLength);
            this.listenTo(this.model, 'destroy', this.hide);
        },
        
        updateStreamItemsLength: function () {
            
            //  TODO: i18n
            if (StreamItems.length === 1) {
                this.itemCount.text(StreamItems.length + " item");
            } else {
                this.itemCount.text(StreamItems.length + " items");
            }

        },
        
        show: function () {
            this.$el.fadeIn(200, function () {
                
                $(this).addClass("visible");

            });
        },
        
        destroyModel: function () {
            console.log("Destroying model");
            this.model.destroy();
        },

        hide: function () {
            var self = this;
            console.log("Hiding");
            this.$el.removeClass('visible').fadeOut(function () {
                self.remove();
            });

        },

    });

    return AddSearchResultsView;
});