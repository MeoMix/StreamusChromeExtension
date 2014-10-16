define([
    'common/enum/listItemType',
    'common/enum/repeatButtonState',
    'foreground/view/behavior/collectionViewMultiSelect',
    'foreground/view/behavior/slidingRender',
    'foreground/view/behavior/sortable',
    'foreground/view/behavior/tooltip',
    'foreground/view/prompt/clearStreamPromptView',
    'foreground/view/prompt/saveSongsPromptView',
    'foreground/view/rightPane/streamItemView',
    'text!template/rightPane/stream.html'
], function (ListItemType, RepeatButtonState, CollectionViewMultiSelect, SlidingRender, Sortable, Tooltip, ClearStreamPromptView, SaveSongsPromptView, StreamItemView, StreamTemplate) {
    'use strict';
    
    var StreamView = Backbone.Marionette.CompositeView.extend({
        id: 'stream',
        className: 'column u-flex--column',
        childViewContainer: '@ui.childContainer',
        childView: StreamItemView,
        childViewOptions: {
            type: ListItemType.StreamItem
        },
        
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
        
        signInManager: null,
        shuffleButton: null,
        radioButton: null,
        repeatButton: null,
        
        initialize: function () {
            this.signInManager = Streamus.backgroundPage.SignInManager;
            this.shuffleButton = Streamus.backgroundPage.ShuffleButton;
            this.radioButton = Streamus.backgroundPage.RadioButton;
            this.repeatButton = Streamus.backgroundPage.RepeatButton;

            this.listenTo(this.signInManager, 'change:signedIn', this._updateSaveButton);
            this.listenTo(this.shuffleButton, 'change:enabled', this._setShuffleButtonState);
            this.listenTo(this.radioButton, 'change:enabled', this._setRadioButtonState);
            this.listenTo(this.repeatButton, 'change:state', this._setRepeatButtonState);
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
            var signedIn = this.signInManager.get('signedIn');
            
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
            if (this.collection.length > 0) {
                this._showClearStreamPrompt();
            }
        },
        
        _save: function() {
            if (this.collection.length > 0) {
                this._showSaveSongsPrompt();
            }
        },
        
        _showClearStreamPrompt: function () {
            Streamus.channels.prompt.commands.trigger('show:prompt', ClearStreamPromptView);
        },
        
        _showSaveSongsPrompt: function() {
            Streamus.channels.prompt.commands.trigger('show:prompt', SaveSongsPromptView, {
                songs: this.collection.pluck('song')
            });
        },
        
        _toggleShuffle: function() {
            this.shuffleButton.toggleEnabled();
        },
        
        _toggleRadio: function() {
            this.radioButton.toggleEnabled();
        },
        
        _toggleRepeat: function() {
            this.repeatButton.toggleRepeatState();
        },
        
        _setRepeatButtonState: function() {
            var state = this.repeatButton.get('state');
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
            var enabled = this.shuffleButton.get('enabled');

            var title;
            if (enabled) {
                title = chrome.i18n.getMessage('shuffleEnabled');
            } else {
                title = chrome.i18n.getMessage('shuffleDisabled');
            }

            this.ui.shuffleButton.toggleClass('is-enabled', enabled).attr('title', title);
        },
        
        _setRadioButtonState: function () {
            var enabled = this.radioButton.get('enabled');
            
            var title;
            if (enabled) {
                title = chrome.i18n.getMessage('radioEnabled');
            } else {
                title = chrome.i18n.getMessage('radioDisabled');
            }
            
            this.ui.radioButton.toggleClass('is-enabled', enabled).attr('title', title);
        },
        
        _showSearch: function () {
            Streamus.channels.global.vent.trigger('showSearch', true);
        }
    });

    return StreamView;
});