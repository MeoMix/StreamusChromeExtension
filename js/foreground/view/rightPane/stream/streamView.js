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
    'utility'
], function (StreamItems, StreamItemView, StreamViewTemplate, RepeatButtonView, ShuffleButtonView, RadioButtonView, SaveStreamButtonView, ClearStreamButtonView, ContextMenuGroups, Utility) {
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
            'contextmenu .list': 'showContextMenu',
            'click .save': 'saveStream',
            'click .clear': 'clearStream'
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

                var selectedStreamItem = this.streamItemList.find('.streamItem.selected');
                selectedStreamItem.scrollIntoView();
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
        
        addItem: function (streamItem) {

            var streamItemView = new StreamItemView({
                model: streamItem,
                parent: this
            });

            var element = streamItemView.render().el;
            this.streamItemList.append(element);

            $(element).find('img.lazy').lazyload({
                effect: 'fadeIn',
                container: this.streamItemList
            });
          
        },
        
        addItems: function (streamItems) {

            var self = this;
            var streamItemViews = _.map(streamItems, function(streamItem) {

                return new StreamItemView({
                    model: streamItem,
                    parent: self
                });

            });

            var elements = _.map(streamItemViews, function (streamItemView) {
                return streamItemView.render().el;
            });

            this.streamItemList.append(elements);
            
            $(elements).find('img.lazy').lazyload({
                effect: 'fadeIn',
                container: this.streamItemList
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
                position: 1,
                items: [{
                    position: 0,
                    text: chrome.i18n.getMessage("clearStream"),
                    title: isClearStreamDisabled ? chrome.i18n.getMessage('clearStreamDisabled') : chrome.i18n.getMessage('clearStream'),
                    disabled: isClearStreamDisabled,
                    onClick: this.clearStream
                }, {
                    position: 1,
                    text: chrome.i18n.getMessage("saveStreamAsPlaylist"),
                    title: isSaveStreamDisabled ? chrome.i18n.getMessage('saveStreamDisabled') : chrome.i18n.getMessage('saveStream'),
                    disabled: isSaveStreamDisabled,
                    onClick: this.saveStream
                }]
            });

        },
        
        saveStream: function () {
            
            //  TODO: Prompt user with dialog to provide playlist name instead of defaulting to the word 'Playlist'
            if (StreamItems.length > 0) {
                this.model.addPlaylistWithVideos('Playlist', StreamItems.pluck('video'));
            }
            
        },
        
        clearStream: function() {
            
            if (StreamItems.length > 0) {
                StreamItems.clear();
            }

        }

    });

    return StreamView;
});