define([
    'common/enum/listItemType',
    'common/enum/repeatButtonState',
    'foreground/model/streamAction',
    'foreground/view/behavior/collectionViewMultiSelect',
    'foreground/view/behavior/slidingRender',
    'foreground/view/behavior/sortable',
    'foreground/view/behavior/tooltip',
    'foreground/view/rightPane/streamItemView',
    'text!template/rightPane/stream.html'
], function (ListItemType, RepeatButtonState, StreamAction, CollectionViewMultiSelect, SlidingRender, Sortable, Tooltip, StreamItemView, StreamTemplate) {
    'use strict';

    var SignInManager = Streamus.backgroundPage.SignInManager;
    var RadioButton = Streamus.backgroundPage.RadioButton;
    var RepeatButton = Streamus.backgroundPage.RepeatButton;
    var ShuffleButton = Streamus.backgroundPage.ShuffleButton;
    
    var StreamView = Backbone.Marionette.CompositeView.extend({
        id: 'stream',
        className: 'column u-flex--column',
        childViewContainer: '@ui.childContainer',
        childView: StreamItemView,
        
        //  Overwrite resortView to only render children as expected
        resortView: function () {
            this._renderChildren();
        },

        template: _.template(StreamTemplate),
        templateHelpers: function () {
            return {
                emptyMessage: chrome.i18n.getMessage('streamEmpty'),
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
            'click @ui.clearButton': '_clear',
            'click @ui.saveButton:not(.disabled)': '_save',
            'click @ui.shuffleButton': '_toggleShuffle',
            'click @ui.radioButton': '_toggleRadio',
            'click @ui.repeatButton': '_toggleRepeat',
            'click @ui.showSearchLink': '_showSearch'
        },
        
        collectionEvents: {
            'add remove reset': '_setViewState'
        },
        
        ui: {
            emptyMessage: '#stream-emptyMessage',
            saveButton: '#stream-saveButton',
            //  NOTE: This has to be named generic for Sortable/SlidingRender behaviors. See issue here: https://github.com/marionettejs/backbone.marionette/issues/1909
            childContainer: '#stream-listItems',
            shuffleButton: '#stream-shuffleButton',
            radioButton: '#stream-radioButton',
            repeatButton: '#stream-repeatButton',
            repeatIcon: '#stream-repeatIcon',
            clearButton: '#stream-clearButton',
            showSearchLink: '#stream-showSearchLink',
            bottomContentBar: '#stream-bottomContentBar'
        },
        
        behaviors: {
            CollectionViewMultiSelect: {
                behaviorClass: CollectionViewMultiSelect
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
            this.listenTo(SignInManager, 'change:signedIn', this._updateSaveButton);
            this.listenTo(ShuffleButton, 'change:enabled', this._setShuffleButtonState);
            this.listenTo(RadioButton, 'change:enabled', this._setRadioButtonState);
            this.listenTo(RepeatButton, 'change:state', this._setRepeatButtonState);
        },
        
        onRender: function () {
            this._setViewState();
            this._setRepeatButtonState();
            this._setShuffleButtonState();
            this._setRadioButtonState();
            this._updateSaveButton();
        },
        
        _setViewState: function() {
            this._toggleBigText();
            this._toggleBottomContentBar();
        },
        
        _updateSaveButton: function () {
            var signedIn = SignInManager.get('signedIn');
            
            var templateHelpers = this.templateHelpers();
            var newTitle = signedIn ? templateHelpers.saveStreamMessage : templateHelpers.cantSaveNotSignedInMessage;

            this.ui.saveButton.toggleClass('disabled', !signedIn);
            this.ui.saveButton.attr('title', newTitle);
        },
        
        //  Hide the empty message if there is anything in the collection
        _toggleBigText: function () {
            this.ui.emptyMessage.toggleClass('hidden', this.collection.length > 0);
        },
        
        //  Show buttons if there is anything in the collection otherwise hide
        _toggleBottomContentBar: function () {
            this.ui.bottomContentBar.toggleClass('hidden', this.collection.length === 0);
            //  Need to update viewportHeight in slidingRender behavior:
            this.triggerMethod('ListHeightUpdated');
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
            switch (state) {
                case RepeatButtonState.Disabled:
                    title = chrome.i18n.getMessage('repeatDisabled');
                    break;
                case RepeatButtonState.RepeatSong:
                    title = chrome.i18n.getMessage('repeatSong');
                    break;
                case RepeatButtonState.RepeatStream:
                    title = chrome.i18n.getMessage('repeatStream');
                    break;
            }

            this.ui.repeatButton
                .toggleClass('is-enabled', enabled)
                .attr('title', title);

            this.ui.repeatIcon
                .toggleClass('is-repeatOne', state === RepeatButtonState.RepeatSong)
                .toggleClass('is-repeatAll', state === RepeatButtonState.RepeatStream);
        },
        
        _setShuffleButtonState: function() {
            var enabled = ShuffleButton.get('enabled');

            var title;
            if (enabled) {
                title = chrome.i18n.getMessage('shuffleEnabled');
            } else {
                title = chrome.i18n.getMessage('shuffleDisabled');
            }

            this.ui.shuffleButton.toggleClass('is-enabled', enabled).attr('title', title);
        },
        
        _setRadioButtonState: function () {
            var enabled = RadioButton.get('enabled');
            
            var title;
            if (enabled) {
                title = chrome.i18n.getMessage('radioEnabled');
            } else {
                title = chrome.i18n.getMessage('radioDisabled');
            }
            
            this.ui.radioButton.toggleClass('is-enabled', enabled).attr('title', title);
        },
        
        _showSearch: function () {
            Backbone.Wreqr.radio.channel('global').vent.trigger('showSearch', true);
        }
    });

    return StreamView;
});