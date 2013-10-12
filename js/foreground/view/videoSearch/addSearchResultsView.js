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
                    'streamItemsLength': StreamItems.length,
                    'selectedResultsLength': VideoSearchResults.selected().length
                })
            ));

            this.$el.find('.addItemOption').droppable({
                hoverClass: 'droppableOnHover',
                tolerance: 'pointer',
                
                drop: function (event, ui) {

                    var draggedVideoId = ui.draggable.data('videoid');
                    var videoSearchResult = VideoSearchResults.get(draggedVideoId);

                    StreamItems.addByVideoInformation(videoSearchResult.get('videoInformation'));

                    var droppableIcon = $(this).find('i.droppable');
                    var checkIcon = droppableIcon.next();

                    checkIcon.removeClass('hidden');
                    droppableIcon.addClass('hidden');

                    clearTimeout(this.resetStateTimeout);

                    this.resetStateTimeout = setTimeout(function() {
                        droppableIcon.removeClass('hidden');
                        checkIcon.addClass('hidden');
                    }, 2500);

                }
            });

            this.itemCount = this.$el.find('span.item-count');
            this.selectedItemsMessage = this.$el.find('span.selectedItemsMessage');

            return this;
        },
        
        initialize: function() {
            this.listenTo(StreamItems, 'add remove', this.updateStreamItemsLength);

            this.listenTo(VideoSearchResults, 'change:selected', this.updateSelectedItemsMessage);

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
        
        updateSelectedItemsMessage: function() {

            var selectedCount = VideoSearchResults.selected().length;
            
            if (selectedCount === 1) {
                this.selectedItemsMessage.text('Add ' + selectedCount + ' item to:');
            } else {
                this.selectedItemsMessage.text('Add ' + selectedCount + ' items to:');
            }

        },
        
        show: function () {
            this.$el.fadeIn(200, function () {
                
                $(this).addClass("visible");

            });
        },
        
        destroyModel: function () {
            this.model.destroy();
        },

        hide: function () {
            var self = this;

            this.$el.removeClass('visible').fadeOut(function () {
                self.remove();
            });

        },

    });

    return AddSearchResultsView;
});