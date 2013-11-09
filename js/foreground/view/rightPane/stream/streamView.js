define([
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
], function (StreamItems, StreamItemView, StreamViewTemplate, RepeatButtonView, ShuffleButtonView, RadioButtonView, SaveStreamButtonView, ClearStreamButtonView, ContextMenuGroups, Utility, StreamAction, Folders) {
    'use strict';
    
    var StreamView = Backbone.View.extend({
        
        className: 'stream',
        
        radioButtonView: null,
        shuffleButtonView: null,
        repeatButtonView: null,
        saveStreamButtonView: null,
        clearStreamButtonView: null,
        
        streamItemList: null,

        template: _.template(StreamViewTemplate),
        
        events: {
            'contextmenu .list': 'showContextMenu'
        },
        
        render: function () {

            this.$el.html(this.template(this.model.toJSON()));
            this.streamItemList = this.$el.children('#streamItemList');

            if (StreamItems.length > 0) {
                
                if (StreamItems.length === 1) {
                    this.addItem(StreamItems.at(0), true);
                } else {
                    this.addItems(StreamItems.models, true);
                }
                
                var streamItems = this.streamItemList.find('.listItem');
                var selectedStreamItem = streamItems.filter('.selected');

                //  It's important to wrap scrollIntoView with a setTimeout because if streamView's element has not been
                //  appended to the DOM yet -- scrollIntoView will not have an effect. Letting the stack clear resolves this.
                setTimeout(function () {
                    selectedStreamItem.scrollIntoView(false);
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

            this.streamItemList.sortable({

                //  Adding this helps prevent unwanted clicks to play
                delay: 100,
                cancel: '.big-text',
                connectWith: '#activePlaylistItems',
                appendTo: 'body',
                containment: 'body',
                placeholder: "sortable-placeholder streamItem",
                forcePlaceholderSize: true,
                scroll: false,
                cursorAt: {
                    right: 35,
                    bottom: 40
                },
                tolerance: 'pointer',
                helper: function (ui, streamItem) {
                    
                    this.copyHelper = streamItem.clone().insertAfter(streamItem);

                    $(this).data('copied', false);

                    return $('<span>', {
                        'class': 'videoSearchResultsLength',
                        'text': 1
                    });
                },
                stop: function () {
                    var copied = $(this).data('copied');

                    if (!copied) {
                        this.copyHelper.remove();
                    }

                    this.copyHelper = null;
                },
                receive: function (event, ui) {

                    var playlistItemId = $(ui.item).data('playlistitemid');
                    var draggedPlaylistItem = Folders.getActiveFolder().getActivePlaylist().get('items').get(playlistItemId);

                    console.log("Dragged index:", ui.item.index());

                    StreamItems.addByDraggedPlaylistItem(draggedPlaylistItem, ui.item.index());
                    $(ui.item).remove();
 
                    ui.sender.data('copied', true);

                }
            });

            var self = this;
            this.$el.find('.scroll').droppable({
                tolerance: 'pointer',
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
                this.streamItemList.trigger('scroll');
            });
            
            //  TODO: mmm... wat? I know the models are hosted on the background page, but there's gotta be a better way to do this.
            this.radioButtonView = new RadioButtonView({
                model: chrome.extension.getBackgroundPage().RadioButton
            });

            this.repeatButtonView = new RepeatButtonView({
                model: chrome.extension.getBackgroundPage().RepeatButton
            });

            this.shuffleButtonView = new ShuffleButtonView({
                model: chrome.extension.getBackgroundPage().ShuffleButton
            });

            this.saveStreamButtonView = new SaveStreamButtonView();
            this.clearStreamButtonView = new ClearStreamButtonView();

            Utility.scrollChildElements(this.el, '.item-title');
            
        },
        
        addItem: function (streamItem, loadImagesInstantly) {
            console.log("StreamItem:", streamItem, loadImagesInstantly);
            var streamItemView = new StreamItemView({
                model: streamItem
            });

            var index = StreamItems.indexOf(streamItem);
            console.log("Item index:", index);

            var element = streamItemView.render().el;
            this.addElementsToStream(element, loadImagesInstantly, index);
            
            if (streamItem.get('selected')) {
                streamItemView.$el.scrollIntoView();
            }

        },
        
        addItems: function (streamItems, loadImagesInstantly) {

            var streamItemViews = _.map(streamItems, function(streamItem) {

                return new StreamItemView({
                    model: streamItem
                });

            });

            var elements = _.map(streamItemViews, function (streamItemView) {
                return streamItemView.render().el;
            });

            this.addElementsToStream(elements, loadImagesInstantly);

            var selectedStreamItem = _.find(streamItems, function(streamItem) {
                return streamItem.get('selected') === true;
            });
            
            var selectedView = _.findWhere(streamItemViews, { model: selectedStreamItem });
            
            console.log("Selected selectedView:", selectedView, selectedStreamItem);
            if (selectedView !== undefined) {
                selectedView.$el.scrollIntoView();
            }

        },
        
        addElementsToStream: function (elements, loadImagesInstantly, index) {
            console.log("Index:", index);
            if (index !== undefined) {
                
                var previousStreamItem = this.streamItemList.children().eq(index);
                
                if (previousStreamItem.length > 0) {
                    previousStreamItem.after(elements);
                } else {
                    this.streamItemList.append(elements);
                }
                
            } else {
                this.streamItemList.append(elements);
            }

            //  The image needs a second to be setup. Wrapping in a setTimeout causes lazyload to work properly.
            setTimeout(function () {

                $(elements).find('img.lazy').lazyload({
                    effect: loadImagesInstantly ? undefined : 'fadeIn',
                    container: this.streamItemList
                });

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
            this.streamItemList.find('.listItem').remove();
        },

        //  TODO: Keep this DRY with others. Need to create a List view which has this stuff in it.
        doAutoScroll: function (event) {

            var scrollElement = $(event.target);
            var direction = scrollElement.data('direction');

            this.streamItemList.autoscroll({
                direction: direction,
                step: 150,
                scroll: true
            });

            var pageX = event.pageX;
            var pageY = event.pageY;

            //  Keep track of pageX and pageY while the mouseMoveInterval is polling.
            this.streamItemList.on('mousemove', function (mousemoveEvent) {
                pageX = mousemoveEvent.pageX;
                pageY = mousemoveEvent.pageY;
            });

            //  Causes the droppable hover to stay correctly positioned.
            this.scrollMouseMoveInterval = setInterval(function () {

                var mouseMoveEvent = $.Event('mousemove');

                mouseMoveEvent.pageX = pageX;
                mouseMoveEvent.pageY = pageY;

                $(document).trigger(mouseMoveEvent);
            }, 100);

        },

        stopAutoScroll: function () {
            this.streamItemList.autoscroll('destroy');
            this.streamItemList.off('mousemove');
            clearInterval(this.scrollMouseMoveInterval);
        }

    });

    return StreamView;
});