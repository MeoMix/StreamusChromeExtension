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

    var SignInManager = Streamus.backgroundPage.SignInManager;
    var RadioButton = Streamus.backgroundPage.RadioButton;
    var RepeatButton = Streamus.backgroundPage.RepeatButton;
    var ShuffleButton = Streamus.backgroundPage.ShuffleButton;
    
    var StreamView = Backbone.Marionette.CompositeView.extend({
        className: 'stream',
        childViewContainer: '@ui.childContainer',
        childView: StreamItemView,
        
        //  Overwrite resortView to only render children as expected
        resortView: function () {
            this._renderChildren();
        },

        template: _.template(StreamTemplate),
        templateHelpers: function () {
            return {
                streamEmptyMessage: chrome.i18n.getMessage('streamEmpty'),
                saveStreamMessage: chrome.i18n.getMessage('saveStream'),
                clearStreamMessage: chrome.i18n.getMessage('clearStream'),
                searchForSongsMessage: chrome.i18n.getMessage('searchForSongs'),
                whyNotAddASongFromAPlaylistOrMessage: chrome.i18n.getMessage('whyNotAddASongFromAPlaylistOr'),
                cantSaveNotSignedInMessage: chrome.i18n.getMessage('cantSaveNotSignedIn')
            };
        },
        
        childViewOptions: {
            type: ListItemType.StreamItem
        },
        
        events: {
            'click @ui.clearStreamButton': '_clear',
            'click @ui.saveStreamButton:not(.disabled)': '_save',
            'click @ui.shuffleButton': '_toggleShuffle',
            'click @ui.radioButton': '_toggleRadio',
            'click @ui.repeatButton': '_toggleRepeat',
            'click @ui.showSearch': function () {
                Backbone.Wreqr.radio.channel('global').vent.trigger('showSearch', true);
            }
        },
        
        collectionEvents: {
            'add remove reset': '_setViewState'
        },
        
        ui: {
            buttons: '.button-icon',
            streamEmptyMessage: '.stream-empty',
            contextButtons: '.context-buttons',
            saveStreamButton: '#save-stream',
            childContainer: '.stream-items',
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
                behaviorClass: SlidingRender
            },
            Sortable: {
                behaviorClass: Sortable
            },
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        initialize: function () {
            this.listenTo(SignInManager, 'change:signedIn', this._updateSaveStreamButton);
            this.listenTo(ShuffleButton, 'change:enabled', this._setShuffleButtonState);
            this.listenTo(RadioButton, 'change:enabled', this._setRadioButtonState);
            this.listenTo(RepeatButton, 'change:state', this._setRepeatButtonState);
        },
        
        onRender: function () {
            this._setViewState();
            this._setRepeatButtonState();
            this._setShuffleButtonState();
            this._setRadioButtonState();
            this._updateSaveStreamButton();
        },
        
        _setViewState: function() {
            this._toggleBigText();
            this._toggleContextButtons();
        },
        
        _updateSaveStreamButton: function () {
            var signedIn = SignInManager.get('signedIn');
            
            var templateHelpers = this.templateHelpers();
            var newTitle = signedIn ? templateHelpers.saveStreamMessage : templateHelpers.cantSaveNotSignedInMessage;

            this.ui.saveStreamButton.toggleClass('disabled', !signedIn);
            this.ui.saveStreamButton.attr('title', newTitle);
        },
        
        //  Hide the empty message if there is anything in the collection
        _toggleBigText: function () {
            this.ui.streamEmptyMessage.toggleClass('hidden', this.collection.length > 0);
        },
        
        //  Show buttons if there is anything in the collection otherwise hide
        _toggleContextButtons: function () {
            this.ui.contextButtons.toggle(this.collection.length > 0);
        },
        
        _clear: function() {
            StreamAction.clearStream();
        },
        
        _save: function() {
            StreamAction.saveStream();
        },
        
        _toggleShuffle: function() {
            ShuffleButton.toggleEnabled();
        },
        
        _toggleRadio: function() {
            RadioButton.toggleEnabled();
        },
        
        _toggleRepeat: function() {
            RepeatButton.toggleRepeatState();
        },
        
        _setRepeatButtonState: function() {
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
        
        _setShuffleButtonState: function() {
            var enabled = ShuffleButton.get('enabled');

            var title;
            if (enabled) {
                title = chrome.i18n.getMessage('shuffleEnabled');
            } else {
                title = chrome.i18n.getMessage('shuffleDisabled');
            }

            this.ui.shuffleButton.toggleClass('enabled', enabled).attr('title', title);
        },
        
        _setRadioButtonState: function () {
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