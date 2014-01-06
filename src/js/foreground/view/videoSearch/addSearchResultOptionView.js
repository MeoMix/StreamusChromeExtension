define([
    'foreground/view/genericForegroundView',
    'text!template/addSearchResultOption.html',
    'foreground/collection/videoSearchResults',
    'enum/addSearchResultOptionType'
], function (GenericForegroundView, AddSearchResultOptionTemplate, VideoSearchResults, AddSearchResultOptionType) {
    'use strict';

    var AddSearchResultOptionView = GenericForegroundView.extend({
        
        className: function () {

            var type = this.model.get('type');

            var typeSpecificClass = '';
            
            switch (type) {
                case AddSearchResultOptionType.Stream:
                    typeSpecificClass = 'stream';
                    break;
                case AddSearchResultOptionType.Playlist:
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
            
            //  Ensure that if the playlist is active -- its option is visible once rendered.
            if (this.model.get('type') === AddSearchResultOptionType.Playlist && this.model.get('entity').get('active')) {
                setTimeout(function() {
                    this.$el.scrollIntoView(false);
                }.bind(this));
            }

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
            
            if (this.model.get('type') === AddSearchResultOptionType.Stream) {
                this.listenTo(entity, 'add addMultiple remove', this.updateItemCount);
            } else {
                this.listenTo(entity.get('items'), 'add addMultiple remove', this.updateItemCount);
            }
        },
        
        updateItemCount: function () {
            var entity = this.model.get('entity');

            var collectionLength;
            
            if (this.model.get('type') === AddSearchResultOptionType.Stream) {
                collectionLength = entity.length;
            } else {
                collectionLength = entity.get('items').length;
            }

            if (collectionLength === 1) {
                this.itemCount.text(collectionLength + ' ' + chrome.i18n.getMessage('item').toLowerCase());
            } else {
                this.itemCount.text(collectionLength + ' ' + chrome.i18n.getMessage('items').toLowerCase());
            }

        }
        
    });

    return AddSearchResultOptionView;
});