define([
    'text!../template/addSearchResultOption.htm',
    'videoSearchResults',
    'addSearchResultOptionType'
], function (AddSearchResultOptionTemplate, VideoSearchResults, AddSearchResultOptionType) {
    'use strict';

    var AddSearchResultOptionView = Backbone.View.extend({
        
        className: function () {

            var type = this.model.get('type');

            var typeSpecificClass = '';
            
            switch (type) {
                case AddSearchResultOptionType.STREAM:
                    typeSpecificClass = 'stream';
                    break;
                case AddSearchResultOptionType.PLAYLIST:
                    typeSpecificClass = 'playlist';
                    break;
                default:
                    console.error('Unhandled type:', type);
                    break;
            }

            return 'addItemOption ' + typeSpecificClass;
        },

        template: _.template(AddSearchResultOptionTemplate),
        
        itemCount: null,
        resetStateTimeout: null,

        render: function () {

            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    'AddSearchResultOptionType': AddSearchResultOptionType
                })
            ));

            this.itemCount = this.$el.find('.item-count');
            this.updateItemCount();

            return this;
        },
        
        initialize: function() {

            var self = this;

            this.$el.droppable({
                hoverClass: 'droppableOnHover',
                tolerance: 'pointer',

                drop: function (event, ui) {
                    
                    var draggedVideoId = ui.draggable.data('videoid');
                    var videoSearchResult = VideoSearchResults.get(draggedVideoId);

                    var type = self.model.get('type');

                    //  TODO: It would be nice to have a common method name here instead of switch statement.
                    switch (type) {
                        case AddSearchResultOptionType.STREAM:
                            self.model.get('entity').addByVideoInformation(videoSearchResult.get('videoInformation'));
                            break;
                        
                        case AddSearchResultOptionType.PLAYLIST:
                            
                            self.model.get('entity').addItemByInformation(videoSearchResult.get('videoInformation'));

                            break;
                            
                        default:
                            console.error("Unhandled type:", type);
                            break;
                    }
                    
                    var droppableIcon = self.$el.find('i.droppable');
                    var checkIcon = droppableIcon.next();

                    checkIcon.removeClass('hidden');
                    droppableIcon.addClass('hidden');

                    clearTimeout(self.resetStateTimeout);

                    self.resetStateTimeout = setTimeout(function () {
                        droppableIcon.removeClass('hidden');
                        checkIcon.addClass('hidden');
                    }, 2500);
                    
                }
            });
            
            //  TODO: Fix 
            var entity = this.model.get('entity');
            
            if (this.model.get('type') === AddSearchResultOptionType.STREAM) {
                this.listenTo(entity, 'add remove', this.updateItemCount);
            } else {
                this.listenTo(entity.get('items'), 'add remove', this.updateItemCount);
            }
            
        },
        
        updateItemCount: function () {
            //  TODO: i18n
            //  TODO: Fix 
            var entity = this.model.get('entity');

            var collectionLength;
            
            if (this.model.get('type') === AddSearchResultOptionType.STREAM) {
                collectionLength = entity.length;
            } else {
                collectionLength = entity.get('items').length;
            }

            if (collectionLength === 1) {
                this.itemCount.text(collectionLength + ' item');
            } else {
                this.itemCount.text(collectionLength + ' items');
            }

        }
        
    });

    return AddSearchResultOptionView;
});