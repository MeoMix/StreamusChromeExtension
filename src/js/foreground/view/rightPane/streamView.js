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
                searchForSongsMessage: chrome.i18n.getMessage('searchForSongs'),
                whyNotAddASongFromAPlaylistOrMessage: chrome.i18n.getMessage('whyNotAddASongFromAPlaylistOr')
            };
        },
        
        events: {
            'click @ui.clearButton:not(.disabled)': '_onClickClearButton',
            'click @ui.saveButton:not(.disabled)': '_onClickSaveButton',
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
            showSearchLink: '#stream-showSearchLink'
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
            this.signInManager = Streamus.backgroundPage.signInManager;
            this.shuffleButton = Streamus.backgroundPage.shuffleButton;
            this.radioButton = Streamus.backgroundPage.radioButton;
            this.repeatButton = Streamus.backgroundPage.repeatButton;

            this.listenTo(this.signInManager, 'change:signedInUser', this._updateSaveButton);
            this.listenTo(this.shuffleButton, 'change:enabled', this._setShuffleButtonState);
            this.listenTo(this.radioButton, 'change:enabled', this._setRadioButtonState);
            this.listenTo(this.repeatButton, 'change:state', this._setRepeatButtonState);
        },
        
        onRender: function () {
            this._setViewState();
            this._setRepeatButtonState();
            this._setShuffleButtonState();
            this._setRadioButtonState();
        },
        
        _setViewState: function() {
            this._toggleBigText();
            this._updateClearButton();
            this._updateSaveButton();
        },
        
        _updateSaveButton: function () {
            var signedOut = this.signInManager.get('signedInUser') === null;
            var streamEmpty = this.collection.length === 0;
            
            var newTitle;
            if (signedOut) {
                newTitle = chrome.i18n.getMessage('notSignedIn');
            } else {
                newTitle = streamEmpty ? chrome.i18n.getMessage('streamEmpty') : chrome.i18n.getMessage('saveStream');
            }

            this.ui.saveButton.toggleClass('disabled', signedOut || streamEmpty);
            this.ui.saveButton.attr('title', newTitle);
        },
        
        _updateClearButton: function () {
            var streamEmpty = this.collection.length === 0;
            var newTitle = streamEmpty ? chrome.i18n.getMessage('streamEmpty') : chrome.i18n.getMessage('clearStream');

            this.ui.clearButton.toggleClass('disabled', streamEmpty);
            this.ui.clearButton.attr('title', newTitle);
        },
        
        //  Hide the empty message if there is anything in the collection
        _toggleBigText: function () {
            this.ui.emptyMessage.toggleClass('hidden', this.collection.length > 0);
        },
        
        _onClickClearButton: function () {
            this._showClearStreamPrompt();
        },
        
        _onClickSaveButton: function () {
            this._showSaveSongsPrompt();
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
            var title = this.repeatButton.getStateMessage();
            
            this.ui.repeatButton
                .toggleClass('is-enabled', enabled)
                .attr('title', title);

            this.ui.repeatIcon
                .toggleClass('is-repeatOne', state === RepeatButtonState.RepeatSong)
                .toggleClass('is-repeatAll', state === RepeatButtonState.RepeatStream);
        },
        
        _setShuffleButtonState: function() {
            var enabled = this.shuffleButton.get('enabled');
            var title = this.shuffleButton.getStateMessage();

            this.ui.shuffleButton.toggleClass('is-enabled', enabled).attr('title', title);
        },
        
        _setRadioButtonState: function () {
            var enabled = this.radioButton.get('enabled');
            var title = this.radioButton.getStateMessage();
            
            this.ui.radioButton.toggleClass('is-enabled', enabled).attr('title', title);
        },
        
        _showSearch: function () {
            Streamus.channels.searchArea.commands.trigger('show', true);
        }
    });

    return StreamView;
});