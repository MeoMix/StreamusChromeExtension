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
    'streamAction'
], function (StreamItems, StreamItemView, StreamViewTemplate, RepeatButtonView, ShuffleButtonView, RadioButtonView, SaveStreamButtonView, ClearStreamButtonView, ContextMenuGroups, Utility, StreamAction) {
    'use strict';
    
    var StreamView = Backbone.View.extend({
        
        className: 'streamView',
        
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
                    this.addByVideo(StreamItems.at(0), true);
                } else {
                    this.addByVideos(StreamItems.models, true);
                }

                var selectedStreamItem = this.streamItemList.find('.streamItem.selected');

                //  It's important to wrap scrollIntoView with a setTimeout because if streamView's element has not been
                //  appended to the DOM yet -- scrollIntoView will not have an effect. Letting the stack clear resolves this.
                setTimeout(function() {
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

            return this;
        },

        initialize: function () {

            //  Whenever an item is added to the collection, visually add an item, too.
            this.listenTo(StreamItems, 'add', this.addItem);
            this.listenTo(StreamItems, 'addMultiple', this.addItems);

            this.listenTo(StreamItems, 'empty', this.render);
            
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
            console.log("StreamItem:", streamItem);
            var streamItemView = new StreamItemView({
                model: streamItem
            });

            var element = streamItemView.render().el;
            this.addElementsToStream(element, loadImagesInstantly);
            
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
        
        addElementsToStream: function (elements, loadImagesInstantly) {
            
            this.streamItemList.append(elements);

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

        }

    });

    return StreamView;
});