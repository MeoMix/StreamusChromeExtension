define(function(require) {
    'use strict';

    var ClearStreamButton = require('foreground/model/clearStreamButton');
    var SaveStreamButton = require('foreground/model/saveStreamButton');
    var ActiveStreamItemView = require('foreground/view/stream/activeStreamItemView');
    var ClearStreamButtonView = require('foreground/view/stream/clearStreamButtonView');
    var RadioButtonView = require('foreground/view/stream/radioButtonView');
    var RepeatButtonView = require('foreground/view/stream/repeatButtonView');
    var SaveStreamButtonView = require('foreground/view/stream/saveStreamButtonView');
    var ShuffleButtonView = require('foreground/view/stream/shuffleButtonView');
    var StreamItemsView = require('foreground/view/stream/streamItemsView');
    var StreamTemplate = require('text!template/stream/stream.html');

    var StreamView = Marionette.LayoutView.extend({
        id: 'stream',
        className: 'flexColumn',
        template: _.template(StreamTemplate),

        templateHelpers: {
            emptyMessage: chrome.i18n.getMessage('streamEmpty'),
            searchForSongsMessage: chrome.i18n.getMessage('searchForSongs'),
            whyNotAddASongFromAPlaylistOrMessage: chrome.i18n.getMessage('whyNotAddASongFromAPlaylistOr')
        },

        regions: {
            clearStreamButtonRegion: '[data-region=clearStreamButton]',
            radioButtonRegion: '[data-region=radioButton]',
            repeatButtonRegion: '[data-region=repeatButton]',
            saveStreamButtonRegion: '[data-region=saveStreamButton]',
            shuffleButtonRegion: '[data-region=shuffleButton]',
            activeStreamItemRegion: '[data-region=activeStreamItem]',
            streamItemsRegion: '[data-region=streamItems]'
        },

        ui: {
            emptyMessage: '[data-ui~=emptyMessage]',
            showSearchLink: '[data-ui~=showSearchLink]'
        },

        events: {
            'click @ui.showSearchLink': '_onClickShowSearchLink'
        },

        modelEvents: {
            'change:activeItem': '_onChangeActiveItem'
        },

        streamItemsEvents: {
            'add:completed': '_onStreamItemsAddCompleted',
            'remove': '_onStreamItemsRemove',
            'reset': '_onStreamItemsReset'
        },

        initialize: function() {
            this.bindEntityEvents(this.model.get('items'), this.streamItemsEvents);
        },

        onRender: function() {
            this._setState(this.model.get('items').isEmpty());

            this.showChildView('streamItemsRegion', new StreamItemsView({
                collection: this.model.get('items')
            }));

            this.showChildView('shuffleButtonRegion', new ShuffleButtonView({
                model: Streamus.backgroundPage.shuffleButton
            }));

            this.showChildView('repeatButtonRegion',new RepeatButtonView({
                model: Streamus.backgroundPage.repeatButton
            }));

            this.showChildView('radioButtonRegion',new RadioButtonView({
                model: Streamus.backgroundPage.radioButton
            }));

            this.showChildView('clearStreamButtonRegion',new ClearStreamButtonView({
                model: new ClearStreamButton({
                    streamItems: this.model.get('items')
                })
            }));

            this.showChildView('saveStreamButtonRegion', new SaveStreamButtonView({
                model: new SaveStreamButton({
                    streamItems: this.model.get('items'),
                    signInManager: Streamus.backgroundPage.signInManager
                })
            }));

            var activeItem = this.model.get('activeItem');
            if (activeItem !== null) {
                this._showActiveStreamItem(activeItem, true);
            }
        },

        _onClickShowSearchLink: function() {
            this._showSearch();
        },

        _onChangeActiveItem: function(model, activeItem) {
            if (activeItem === null) {
                this.getChildView('activeStreamItemRegion').hide();
            } else {
                //  If there was already an activeItem shown then do not need to transition in the new view because one is already fully visible.
                var instant = model.previous('activeItem') !== null;
                this._showActiveStreamItem(activeItem, instant);
            }
        },

        _onStreamItemsAddCompleted: function(collection) {
            this._setState(collection.isEmpty());
        },

        _onStreamItemsRemove: function(model, collection) {
            this._setState(collection.isEmpty());
        },

        _onStreamItemsReset: function(collection) {
            this._setState(collection.isEmpty());
        },
        
        //  Hide the empty message if there is anything in the collection
        _setState: function(collectionEmpty) {
            this.ui.emptyMessage.toggleClass('is-hidden', !collectionEmpty);
        },

        _showSearch: function() {
            Streamus.channels.searchArea.commands.trigger('show:search');
        },

        _showActiveStreamItem: function(activeStreamItem, instant) {
            this.showChildView('activeStreamItemRegion', new ActiveStreamItemView({
                model: activeStreamItem,
                player: Streamus.backgroundPage.player,
                instant: instant
            }));
        }
    });

    return StreamView;
});