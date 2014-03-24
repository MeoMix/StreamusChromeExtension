define([
    'background/collection/playlists',
    'background/collection/videoSearchResults',
    'background/model/user',
    'background/model/buttons/radioButton',
    'background/model/buttons/repeatButton',
    'background/model/buttons/shuffleButton',
    'common/enum/listItemType',
    'common/enum/repeatButtonState',
    'foreground/eventAggregator',
    'foreground/model/streamAction',
    'foreground/view/multiSelectCompositeView',
    'foreground/view/rightBasePane/streamItemView',
    'text!template/stream.html'
], function (Playlists, VideoSearchResults, User, RadioButton, RepeatButton, ShuffleButton, ListItemType, RepeatButtonState, EventAggregator, StreamAction, MultiSelectCompositeView, StreamItemView, StreamTemplate) {
    'use strict';
    
    var StreamView = MultiSelectCompositeView.extend({
        
        id: 'stream',
        //  TODO: Marionette 2.0 will support referencing through @ui: https://github.com/marionettejs/backbone.marionette/issues/1033
        itemViewContainer: '#stream-items',
        itemView: StreamItemView,

        template: _.template(StreamTemplate),
        templateHelpers: function () {
            return {
                streamEmptyMessage: chrome.i18n.getMessage('streamEmpty'),
                saveStreamMessage: chrome.i18n.getMessage('saveStream'),
                clearStreamMessage: chrome.i18n.getMessage('clearStream'),
                searchForVideosMessage: chrome.i18n.getMessage('searchForVideos'),
                whyNotAddAVideoFromAPlaylistOrMessage: chrome.i18n.getMessage('whyNotAddAVideoFromAPlaylistOr'),
                cantSaveNotSignedInMessage: chrome.i18n.getMessage('cantSaveNotSignedIn'),
                userSignedIn: User.get('signedIn')
            };
        },
        
        events: _.extend({}, MultiSelectCompositeView.prototype.events, {
            'click @ui.clearStreamButton': 'clear',
            'click @ui.enabledSaveStreamButton': 'save',
            'scroll @ui.stream-items': 'loadVisible',
            'click @ui.shuffleButton': 'toggleShuffle',
            'click @ui.radioButton': 'toggleRadio',
            'click @ui.repeatButton': 'toggleRepeat',
            
            'click @ui.showVideoSearch': function () {
                EventAggregator.trigger('streamView:showVideoSearch');
            }
        }),
        
        collectionEvents: {
            'add remove reset': function () {
                this.toggleBigText();
                this.toggleContextButtons();

                //  Trigger a scroll event because an item could slide into view and lazy loading would need to happen.
                this.$el.trigger('scroll');
            }
        },
        
        ui: {
            streamEmptyMessage: '.stream-empty',
            contextButtons: '.context-buttons',
            saveStreamButton: '#save-stream',
            //  TODO: This seems wrong.
            enabledSaveStreamButton: '#save-stream:not(.disabled)',
            itemContainer: '#stream-items',
            shuffleButton: '#shuffle-button',
            radioButton: '#radio-button',
            repeatButton: '#repeat-button',
            clearStreamButton: 'button.clear',
            showVideoSearch: '.show-video-search'
        },
        
        onShow: function () {
            this.onFullyVisible();
            
            //  TODO: Kinda too explicit
            this.ui.saveStreamButton.qtip();
            this.ui.shuffleButton.qtip();
            this.ui.radioButton.qtip();
            this.ui.repeatButton.qtip();
            this.ui.clearStreamButton.qtip();

            this.children.each(function(child) {
                child.setTitleTooltip(child.ui.title);
            });
        },
        
        onRender: function () {
            this.toggleBigText();
            this.toggleContextButtons();

            this.setRepeatButtonState();
            this.setShuffleButtonState();
            this.setRadioButtonState();
            this.updateSaveStreamButton();
            
            if (this.collection.length > 0) {
                this.$el.find('.list-item.active').scrollIntoView(false);
                this.$el.trigger('scroll');
            }

            MultiSelectCompositeView.prototype.onRender.call(this, arguments);
        },
        
        initialize: function() {
            this.listenTo(User, 'change:signedIn', this.updateSaveStreamButton);
            this.listenTo(ShuffleButton, 'change:enabled', this.setShuffleButtonState);
            this.listenTo(RadioButton, 'change:enabled', this.setRadioButtonState);
            this.listenTo(RepeatButton, 'change:state', this.setRepeatButtonState);
        },
        
        updateSaveStreamButton: function () {
            var userSignedIn = User.get('signedIn');
            
            var templateHelpers = this.templateHelpers();
            var newTitle = userSignedIn ? templateHelpers.saveStreamMessage : templateHelpers.cantSaveNotSignedInMessage;

            this.ui.saveStreamButton.toggleClass('disabled', !userSignedIn);
            this.ui.saveStreamButton.attr('title', newTitle);
            
            //  Be sure to call render first or else setting content.text won't actually update it.
            this.ui.saveStreamButton.qtip('render');
            this.ui.saveStreamButton.qtip('option', 'content.text', newTitle);
        },
        
        //  Hide the empty message if there is anything in the collection
        toggleBigText: function () {
            this.ui.streamEmptyMessage.toggleClass('hidden', this.collection.length > 0);
        },
        
        //  Show buttons if there is anything in the collection otherwise hide
        toggleContextButtons: function () {
            this.ui.contextButtons.toggle(this.collection.length > 0);
        },

        //  TODO: This adds support for a sorted collection, but is slower than using the default implementation which leverages a document fragment.
        //  https://github.com/marionettejs/backbone.marionette/wiki/Adding-support-for-sorted-collections
        //  https://github.com/marionettejs/backbone.marionette/blob/master/docs/marionette.collectionview.md#collectionviews-appendhtml
        appendHtml: function (collectionView, itemView, index) {
            var childrenContainer = collectionView.itemViewContainer ? collectionView.$(collectionView.itemViewContainer) : collectionView.$el;
            var children = childrenContainer.children();
            if (children.size() <= index) {
                childrenContainer.append(itemView.el);
            } else {
                children.eq(index).before(itemView.el);
            }
        },
        
        clear: function() {
            StreamAction.clearStream();
        },
        
        save: function() {
            StreamAction.saveStream();
        },
        
        toggleShuffle: function() {
            ShuffleButton.toggleEnabled();
        },
        
        toggleRadio: function() {
            RadioButton.toggleRadio();
        },
        
        toggleRepeat: function() {
            RepeatButton.toggleRepeat();
        },
        
        setRepeatButtonState: function() {
            var state = RepeatButton.get('state');
            
            //  The button is considered enabled if it is anything but disabled.
            var enabled = state !== RepeatButtonState.Disabled;

            var title = '';
            var icon = $('<i>', { 'class': 'fa fa-repeat' });
            switch (state) {
                case RepeatButtonState.Disabled:
                    title = chrome.i18n.getMessage('repeatDisabled');
                    break;
                case RepeatButtonState.RepeatVideo:
                    title = chrome.i18n.getMessage('repeatVideo');
                    icon = $('<i>', { 'class': 'fa fa-repeat repeat-video' });
                    break;
                case RepeatButtonState.RepeatStream:
                    title = chrome.i18n.getMessage('repeatStream');
                    icon = $('<i>', { 'class': 'fa fa-repeat repeat-stream' });
                    break;
            }

            this.ui.repeatButton.toggleClass('enabled', enabled).attr('title', title).empty().append(icon);
        },
        
        setShuffleButtonState: function() {
            var enabled = ShuffleButton.get('enabled');

            var title;
            if (enabled) {
                title = chrome.i18n.getMessage('shuffleEnabled');
            } else {
                title = chrome.i18n.getMessage('shuffleDisabled');
            }

            this.ui.shuffleButton.toggleClass('enabled', enabled).attr('title', title);
        },
        
        setRadioButtonState: function () {
            var enabled = RadioButton.get('enabled');
            
            var title;
            if (enabled) {
                title = chrome.i18n.getMessage('radioEnabled');
            } else {
                title = chrome.i18n.getMessage('radioDisabled');
            }
            
            this.ui.radioButton.toggleClass('enabled', enabled).attr('title', title);
        }

    });

    return StreamView;
});