define([
    'common/enum/listItemType',
    'common/enum/repeatButtonState',
    'foreground/eventAggregator',
    'foreground/model/streamAction',
    'foreground/view/multiSelectCompositeView',
    'foreground/view/rightBasePane/streamItemView',
    'text!template/stream.html'
], function (ListItemType, RepeatButtonState, EventAggregator, StreamAction, MultiSelectCompositeView, StreamItemView, StreamTemplate) {
    'use strict';

    var User = chrome.extension.getBackgroundPage().User;
    var RadioButton = chrome.extension.getBackgroundPage().RadioButton;
    var RepeatButton = chrome.extension.getBackgroundPage().RepeatButton;
    var ShuffleButton = chrome.extension.getBackgroundPage().ShuffleButton;
    
    var StreamView = MultiSelectCompositeView.extend({
        
        id: 'stream',
        //  TODO: Marionette 2.0 will support referencing through @ui: https://github.com/marionettejs/backbone.marionette/issues/1033
        itemViewContainer: '#stream-items',
        itemView: StreamItemView,
        
        //  TODO: Fix hardcoding this.. tricky because items are added before onShow and onShow is when the viewportHeight is able to be determined.
        viewportHeight: 291,

        template: _.template(StreamTemplate),
        templateHelpers: function () {
            return {
                streamEmptyMessage: chrome.i18n.getMessage('streamEmpty'),
                saveStreamMessage: chrome.i18n.getMessage('saveStream'),
                clearStreamMessage: chrome.i18n.getMessage('clearStream'),
                searchForSongsMessage: chrome.i18n.getMessage('searchForSongs'),
                whyNotAddASongFromAPlaylistOrMessage: chrome.i18n.getMessage('whyNotAddASongFromAPlaylistOr'),
                cantSaveNotSignedInMessage: chrome.i18n.getMessage('cantSaveNotSignedIn'),
                userSignedIn: User.get('signedIn')
            };
        },
        
        events: _.extend({}, MultiSelectCompositeView.prototype.events, {
            'click @ui.clearStreamButton': 'clear',
            'click @ui.saveStreamButton:not(.disabled)': 'save',
            'scroll @ui.stream-items': 'loadVisible',
            'click @ui.shuffleButton': 'toggleShuffle',
            'click @ui.radioButton': 'toggleRadio',
            'click @ui.repeatButton': 'toggleRepeat',
            
            'click @ui.showSearch': function () {
                EventAggregator.trigger('showSearch');
            }
        }),
        
        collectionEvents: _.extend({}, MultiSelectCompositeView.prototype.collectionEvents, {
            'change:active': function(item, active) {
                if (active) {
                    this.scrollToItem(item);
                }
            },
            'add remove reset': function () {
                //  TODO: Is it costly to be calling these every time add/remove happens? Seems like it might be.
                this.toggleBigText();
                this.toggleContextButtons();
                
                //  TODO: This isn't being called even though I expect collectionEvents -- how to fix?
                this._setHeight();
            }
        }),
        
        ui: _.extend({}, MultiSelectCompositeView.prototype.ui, {
            buttons: '.button-icon',
            streamEmptyMessage: '.stream-empty',
            contextButtons: '.context-buttons',
            saveStreamButton: '#save-stream',
            itemContainer: '#stream-items',
            shuffleButton: '#shuffle-button',
            radioButton: '#radio-button',
            repeatButton: '#repeat-button',
            clearStreamButton: 'button.clear',
            showSearch: '.show-search'
        }),
        
        onShow: function () {
            this.onFullyVisible();

            this.ui.buttons.qtip();
            
            this.children.each(function(child) {
                child.setTitleTooltip(child.ui.title);
            });

            this.scrollToItem(this.collection.getActiveItem());
        },
        
        onRender: function () {
            this.toggleBigText();
            this.toggleContextButtons();

            this.setRepeatButtonState();
            this.setShuffleButtonState();
            this.setRadioButtonState();
            this.updateSaveStreamButton();

            MultiSelectCompositeView.prototype.onRender.apply(this, arguments);
        },
        
        initialize: function() {
            this.listenTo(User, 'change:signedIn', this.updateSaveStreamButton);
            this.listenTo(ShuffleButton, 'change:enabled', this.setShuffleButtonState);
            this.listenTo(RadioButton, 'change:enabled', this.setRadioButtonState);
            this.listenTo(RepeatButton, 'change:state', this.setRepeatButtonState);

            console.log("Stream view active item:", this.collection.getActiveItem());

            MultiSelectCompositeView.prototype.initialize.apply(this, arguments);
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
                case RepeatButtonState.RepeatSong:
                    title = chrome.i18n.getMessage('repeatSong');
                    icon = $('<i>', { 'class': 'fa fa-repeat repeat-song' });
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
        },
        
        //  Ensure that the active item is visible by setting the container's scrollTop to a position which allows it to be seen.
        scrollToItem: function (item) {
            if (this.collection.length > 0) {
                var activeItemTop = this.collection.indexOf(item) * this.itemViewHeight;
                console.log("activeItemTop:", activeItemTop);
                //  TODO: Play with this... it's moving items when it shouldn't.
                this.ui.list[0].scrollTop = activeItemTop;
            }
        }

    });

    return StreamView;
});