define([
    'genericScrollableView',
    'streamItems',
    'streamItemView',
    'text!../template/streamView.htm',
    'repeatButtonView',
    'shuffleButtonView',
    'radioButtonView',
    'saveStreamButtonView',
    'clearStreamButtonView',
    'contextMenuGroups',
    'utility',
    'streamAction',
    'folders'
], function (GenericScrollableView, StreamItems, StreamItemView, StreamViewTemplate, RepeatButtonView, ShuffleButtonView, RadioButtonView, SaveStreamButtonView, ClearStreamButtonView, ContextMenuGroups, Utility, StreamAction, Folders) {
    'use strict';
    
    var StreamView = GenericScrollableView.extend({
        
        className: 'stream',
        
        radioButtonView: null,
        shuffleButtonView: null,
        repeatButtonView: null,
        saveStreamButtonView: null,
        clearStreamButtonView: null,

        list: null,

        template: _.template(StreamViewTemplate),
        
        events: {
            'contextmenu .list': 'showContextMenu'
        },
        
        render: function () {
            var self = this;
            
            this.$el.html(this.template(this.model.toJSON()));
            this.list = this.$el.children('#streamItemList');
        
            if (StreamItems.length > 0) {
                
                if (StreamItems.length === 1) {
                    this.addItem(StreamItems.at(0));
                } else {
                    this.addItems(StreamItems.models);
                }
                
                var streamItems = this.list.find('.listItem');
                var selectedStreamItem = streamItems.filter('.selected');

                //  It's important to wrap scrollIntoView with a setTimeout because if streamView's element has not been
                //  appended to the DOM yet -- scrollIntoView will not have an effect. Letting the stack clear resolves this.
                setTimeout(function () {
                    selectedStreamItem.scrollIntoView(false);
                    self.list.trigger('scroll');
                });
  
            }

            var contextButtons = this.$el.children('.context-buttons');

            var rightGroupContextButtons = contextButtons.children('.right-group');

            rightGroupContextButtons.append(this.saveStreamButtonView.render().el);
            rightGroupContextButtons.append(this.clearStreamButtonView.render().el);

            var leftGroupContextButtons = contextButtons.children('.left-group');

            leftGroupContextButtons.append(this.shuffleButtonView.render().el);
            leftGroupContextButtons.append(this.repeatButtonView.render().el);
            leftGroupContextButtons.append(this.radioButtonView.render().el);

            this.list.sortable({

                //  Adding this helps prevent unwanted clicks to play
                delay: 100,
                cancel: '.big-text',
                connectWith: '#activePlaylistItems',
                appendTo: 'body',
                containment: 'body',
                placeholder: "sortable-placeholder listItem",
                forcePlaceholderSize: true,
                scroll: false,
                cursorAt: {
                    right: 35,
                    bottom: 40
                },
                tolerance: 'pointer',
                helper: function (ui, streamItem) {
                    
                    //  Create a new view instead of just copying the HTML in order to preserve HTML->Backbone.View relationship
                    var copyHelperView = new StreamItemView({
                        model: StreamItems.get(streamItem.data('streamitemid')),
                        //  Don't lazy-load the view because copy helper is clearly visible
                        instant: true
                    });

                    this.copyHelper = copyHelperView.render().$el.insertAfter(streamItem);
                    this.copyHelper.css({
                        opacity: '.5'
                    }).addClass('copyHelper');
                    
                    this.backCopyHelper = streamItem.prev();
                    this.backCopyHelper.addClass('copyHelper');

                    $(this).data('copied', false);

                    return $('<span>', {
                        'class': 'videoSearchResultsLength',
                        'text': 1
                    });
                },
                start: function () {
                    $('body').addClass('dragging');
                },
                stop: function () {
                    $('body').removeClass('dragging');
                    this.backCopyHelper.removeClass('copyHelper');
                    
                    var copied = $(this).data('copied');
                    if (copied) {
                        this.copyHelper.css({
                            opacity: 1
                        }).removeClass('copyHelper');
                    }
                    else {
                        this.copyHelper.remove();
                    }

                    this.copyHelper = null;
                    this.backCopyHelper = null;
                },
    
                receive: function (event, ui) {

                    var playlistItemId = $(ui.item).data('playlistitemid');
                    var draggedPlaylistItem = Folders.getActiveFolder().getActivePlaylist().get('items').get(playlistItemId);

                    StreamItems.addByDraggedPlaylistItem(draggedPlaylistItem, ui.item.index());
                    $(ui.item).remove();
 
                    ui.sender.data('copied', true);
                },
                update: function (event, ui) {
                    
                    var streamItemId = ui.item.data('streamitemid');

                    //  Don't run this code when handling playlist items -- only when reorganizing stream items.
                    if (this === ui.item.parent()[0] && streamItemId) {
                        //  It's important to do this to make sure I don't count my helper elements in index.
                        var newIndex = parseInt(ui.item.parent().children('.listItem').index(ui.item));
                        var currentIndex = StreamItems.indexOf(StreamItems.get(streamItemId));
                        StreamItems.models.splice(newIndex, 0, StreamItems.models.splice(currentIndex, 1)[0]);
                    }
                }
            });

            this.$el.find('.scroll').droppable({
                tolerance: 'pointer',
                //  Prevent stuttering of tooltips and general oddities by being specific with accept
                accept: '.listItem:not(.videoSearchResult)',
                over: function (event) {
                    self.doAutoScroll(event);
                },
                drop: function () {
                    self.stopAutoScroll();
                },
                out: function () {
                    self.stopAutoScroll();
                }
            });

            return this;
        },

        initialize: function () {

            //  Whenever an item is added to the collection, visually add an item, too.
            this.listenTo(StreamItems, 'add', this.addItem);
            this.listenTo(StreamItems, 'addMultiple', this.addItems);
            this.listenTo(StreamItems, 'empty', this.emptyStreamItemList);
            
            this.listenTo(StreamItems, 'remove', function () {
                //  Trigger a scroll event because an item could slide into view and lazy loading would need to happen.
                this.list.trigger('scroll');
            });

            this.listenTo(StreamItems, 'change:selected', function () {

                var selectedListItemElement = this.list.find('.listItem.selected');
                
                if (selectedListItemElement.length === 1) {
                    selectedListItemElement.scrollIntoView(true);
                }

                this.list.trigger('scroll');
            });
            
            this.radioButtonView = new RadioButtonView();
            this.repeatButtonView = new RepeatButtonView();
            this.shuffleButtonView = new ShuffleButtonView();

            this.saveStreamButtonView = new SaveStreamButtonView();
            this.clearStreamButtonView = new ClearStreamButtonView();

            Utility.scrollChildElements(this.el, '.item-title');
            
            $(window).unload(function () {
                this.stopListening();
            }.bind(this));
            
        },
        
        addItem: function (streamItem) {

            var streamItemView = new StreamItemView({
                model: streamItem
            });

            var index = StreamItems.indexOf(streamItem);

            var element = streamItemView.render().el;
            this.addElementsToStream(element, index);
            
            if (streamItem.get('selected')) {
                streamItemView.$el.scrollIntoView();
            }

        },
        
        addItems: function (streamItems) {

            var streamItemViews = _.map(streamItems, function(streamItem) {

                return new StreamItemView({
                    model: streamItem
                });

            });

            var elements = _.map(streamItemViews, function (streamItemView) {
                return streamItemView.render().el;
            });

            this.addElementsToStream(elements);

            var selectedStreamItem = _.find(streamItems, function(streamItem) {
                return streamItem.get('selected') === true;
            });
            
            var selectedView = _.findWhere(streamItemViews, { model: selectedStreamItem });
            
            if (selectedView !== undefined) {
                selectedView.$el.scrollIntoView();
            }

        },
        
        addElementsToStream: function (elements, index) {

            if (index !== undefined) {
                
                var previousStreamItem = this.list.children().eq(index + 1);
     
                if (previousStreamItem.length > 0) {
                    previousStreamItem.after(elements);
                } else {
                    this.list.append(elements);
                }
                
            } else {
                this.list.append(elements);
            }

            var self = this;
            //  The image needs a second to be setup. Wrapping in a setTimeout causes lazyload to work properly.
            setTimeout(function () {

                if (_.isArray(elements)) {
                    var elementsInViewport = _.filter(elements, function (element) {
                        return $.inviewport(element, { threshold: 0, container: window });
                    });

                    var elementsNotInViewport = _.filter(elements, function (element) {
                        return !$.inviewport(element, { threshold: 0, container: window });
                    });

                    $(elementsInViewport).find('img.lazy').lazyload({
                        container: self.list
                    });

                    $(elementsNotInViewport).find('img.lazy').lazyload({
                        effect: 'fadeIn',
                        threshold: 500,
                        container: self.list
                    });
                } else {
                    var isInViewport = $.inviewport(elements, { threshold: 0, container: window });
                    $(elements).find('img.lazy').lazyload({
                        effect: isInViewport ? undefined : 'fadeIn',
                        threshold: 500,
                        container: self.list
                    });
                }

            });
            
        },
        
        showContextMenu: function (event) {

            //  Whenever a context menu is shown -- set preventDefault to true to let foreground know to not reset the context menu.
            event.preventDefault();

            if (event.target === event.currentTarget) {
                //  Didn't bubble up from a child -- clear groups.
                ContextMenuGroups.reset();
            }
            
            var isClearStreamDisabled = StreamItems.length === 0;
            var isSaveStreamDisabled = StreamItems.length === 0;

            ContextMenuGroups.add({
                items: [{
                    text: chrome.i18n.getMessage("clearStream"),
                    title: isClearStreamDisabled ? chrome.i18n.getMessage('clearStreamDisabled') : chrome.i18n.getMessage('clearStream'),
                    disabled: isClearStreamDisabled,
                    onClick: function() {
                        StreamAction.clearStream();
                    }
                }, {
                    text: chrome.i18n.getMessage("saveAsPlaylist"),
                    title: isSaveStreamDisabled ? chrome.i18n.getMessage('saveStreamDisabled') : chrome.i18n.getMessage('saveStream'),
                    disabled: isSaveStreamDisabled,
                    onClick: function() {
                        StreamAction.saveStream();
                    }
                }]
            });

        },
        
        emptyStreamItemList: function() {
            this.list.find('.streamItem').remove();
        }

    });

    return StreamView;
});