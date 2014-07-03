define([
    'common/enum/listItemType',
    'common/enum/repeatButtonState',
    'foreground/model/streamAction',
    'foreground/view/behavior/multiSelect',
    'foreground/view/behavior/slidingRender',
    'foreground/view/behavior/sortable',
    'foreground/view/behavior/tooltip',
    'foreground/view/rightBasePane/streamItemView',
    'text!template/stream.html'
], function (ListItemType, RepeatButtonState, StreamAction, MultiSelect, SlidingRender, Sortable, Tooltip, StreamItemView, StreamTemplate) {
    'use strict';

    var User = chrome.extension.getBackgroundPage().User;
    var RadioButton = chrome.extension.getBackgroundPage().RadioButton;
    var RepeatButton = chrome.extension.getBackgroundPage().RepeatButton;
    var ShuffleButton = chrome.extension.getBackgroundPage().ShuffleButton;
    
    var StreamView = Backbone.Marionette.CompositeView.extend({
        id: 'stream',
        childViewContainer: '@ui.childContainer',
        childView: StreamItemView,

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
        
        events: {
            'click @ui.clearStreamButton': 'clear',
            'click @ui.saveStreamButton:not(.disabled)': 'save',
            'scroll @ui.stream-items': 'loadVisible',
            'click @ui.shuffleButton': 'toggleShuffle',
            'click @ui.radioButton': 'toggleRadio',
            'click @ui.repeatButton': 'toggleRepeat',
            'click @ui.showSearch': function () {
                window.Application.vent.trigger('showSearch', true);
            }
        },
        
        collectionEvents: {
            'add remove reset': function () {
                this.toggleBigText();
                this.toggleContextButtons();
            }
        },
        
        ui: {
            buttons: '.button-icon',
            streamEmptyMessage: '.stream-empty',
            contextButtons: '.context-buttons',
            saveStreamButton: '#save-stream',
            childContainer: '#stream-items',
            shuffleButton: '#shuffle-button',
            radioButton: '#radio-button',
            repeatButton: '#repeat-button',
            clearStreamButton: 'button.clear',
            showSearch: '.show-search'
        },
        
        behaviors: {
            MultiSelect: {
                behaviorClass: MultiSelect
            },
            SlidingRender: {
                behaviorClass: SlidingRender,
                //  TODO: Fix hardcoding this.. tricky because items are added before onShow and onShow is when the viewportHeight is able to be determined.
                viewportHeight: 291
            },
            Sortable: {
                behaviorClass: Sortable
            },
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        onShow: function () {
            this.triggerMethod('FullyVisible');
        },
        
        onRender: function () {
            this.toggleBigText();
            this.toggleContextButtons();
            this.setRepeatButtonState();
            this.setShuffleButtonState();
            this.setRadioButtonState();
            this.updateSaveStreamButton();
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
        }
    });

    return StreamView;
});