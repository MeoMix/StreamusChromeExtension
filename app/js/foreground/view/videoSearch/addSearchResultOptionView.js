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
                    
                    //  Highlight the active playlist
                    if (this.model.get('entity').get('active')) {
                        typeSpecificClass += ' active';
                    }

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
                
                drop: function () {

                    //  When scrolling through options you can have a non-visible option scroll underneath another droppable
                    //  This causes two events to fire. Stop the second event by checking to see if the drop target is visible.
                    if ($(this).position().top < 0) return false;

                    var selectedSearchResults = VideoSearchResults.selected();
                    var videos = _.map(selectedSearchResults, function (searchResult) {
                        return searchResult.get('video');
                    });
               
                    self.model.get('entity').addByVideos(videos);
                    
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
            
            var entity = this.model.get('entity');
            
            if (this.model.get('type') === AddSearchResultOptionType.STREAM) {
                this.listenTo(entity, 'add addMultiple remove', this.updateItemCount);
            } else {
                this.listenTo(entity.get('items'), 'add addMultiple remove', this.updateItemCount);
            }
            
            $(window).unload(function () {
                this.stopListening();
            }.bind(this));
            
        },
        
        updateItemCount: function () {
            var entity = this.model.get('entity');

            var collectionLength;
            
            if (this.model.get('type') === AddSearchResultOptionType.STREAM) {
                collectionLength = entity.length;
            } else {
                collectionLength = entity.get('items').length;
            }

            if (collectionLength === 1) {
                this.itemCount.text(collectionLength + ' ' + chrome.i18n.getMessage('item'));
            } else {
                this.itemCount.text(collectionLength + ' ' + chrome.i18n.getMessage('items'));
            }

        }
        
    });

    return AddSearchResultOptionView;
});