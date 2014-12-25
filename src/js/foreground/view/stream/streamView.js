define([
    'foreground/model/clearStreamButton',
    'foreground/model/saveStreamButton',
    'foreground/view/stream/activeStreamItemRegion',
    'foreground/view/stream/activeStreamItemView',
    'foreground/view/stream/clearStreamButtonView',
    'foreground/view/stream/radioButtonView',
    'foreground/view/stream/repeatButtonView',
    'foreground/view/stream/saveStreamButtonView',
    'foreground/view/stream/shuffleButtonView',
    'foreground/view/stream/streamItemsView',
    'text!template/stream/stream.html'
], function (ClearStreamButton, SaveStreamButton, ActiveStreamItemRegion, ActiveStreamItemView, ClearStreamButtonView, RadioButtonView, RepeatButtonView, SaveStreamButtonView, ShuffleButtonView, StreamItemsView, StreamTemplate) {
    'use strict';
    
    var StreamView = Marionette.LayoutView.extend({
        id: 'stream',
        className: 'column u-flex--column',
        template: _.template(StreamTemplate),
        
        templateHelpers: function () {
            return {
                viewId: this.id,
                emptyMessage: chrome.i18n.getMessage('streamEmpty'),
                searchForSongsMessage: chrome.i18n.getMessage('searchForSongs'),
                whyNotAddASongFromAPlaylistOrMessage: chrome.i18n.getMessage('whyNotAddASongFromAPlaylistOr')
            };
        },

        regions: function () {
            return {
                clearStreamButtonRegion: '#' + this.id + '-clearStreamButtonRegion',
                radioButtonRegion: '#' + this.id + '-radioButtonRegion',
                repeatButtonRegion: '#' + this.id + '-repeatButtonRegion',
                saveStreamButtonRegion: '#' + this.id + '-saveStreamButtonRegion',
                shuffleButtonRegion: '#' + this.id + '-shuffleButtonRegion',
                activeStreamItemRegion: {
                    el: '#' + this.id + '-activeStreamItemRegion',
                    regionClass: ActiveStreamItemRegion
                },
                streamItemsRegion: '#' + this.id + '-streamItemsRegion'
            };
        },
        
        ui: function () {
            return {
                emptyMessage: '#' + this.id + '-emptyMessage',
                showSearchLink: '#' + this.id + '-showSearchLink'
            };
        },
        
        events: {
            'click @ui.showSearchLink': '_onClickShowSearchLink'
        },
        
        modelEvents: {
            'change:activeItem': '_onChangeActiveItem'
        },
        
        initialize: function () {
            var streamItems = this.model.get('items');
            this.listenTo(streamItems, 'add', this._onStreamItemsAdd);
            this.listenTo(streamItems, 'remove', this._onStreamItemsRemove);
            this.listenTo(streamItems, 'reset', this._onStreamItemsReset);
        },
        
        onRender: function () {
            this._setState(this.model.get('items').isEmpty());
        },
        
        onShow: function () {
            this.shuffleButtonRegion.show(new ShuffleButtonView({
                model: Streamus.backgroundPage.shuffleButton
            }));
            
            this.repeatButtonRegion.show(new RepeatButtonView({
                model: Streamus.backgroundPage.repeatButton
            }));
            
            this.radioButtonRegion.show(new RadioButtonView({
                model: Streamus.backgroundPage.radioButton
            }));
            
            this.clearStreamButtonRegion.show(new ClearStreamButtonView({
                model: new ClearStreamButton({
                    streamItems: this.model.get('items')
                })
            }));
            
            this.saveStreamButtonRegion.show(new SaveStreamButtonView({
                model: new SaveStreamButton({
                    streamItems: this.model.get('items'),
                    signInManager: Streamus.backgroundPage.signInManager
                })
            }));
            
            var activeItem = this.model.get('activeItem');
            if (activeItem !== null) {
                this.activeStreamItemRegion.showView(activeItem, true);
            }
            
            //  TODO: I don't think this is true now that I am not reliant on height in slidingRender. Unless it also matters for Tooltip?
            //  IMPORTANT: This needs to be appended LAST because flexbox calculations require everything to be in place.
            this.streamItemsRegion.show(new StreamItemsView({
                collection: this.model.get('items')
            }));
        },
        
        _onClickShowSearchLink: function () {
            this._showSearch();
        },

        _onChangeActiveItem: function (model, activeItem) {
            if (activeItem === null) {
                this.activeStreamItemRegion.hideView();
            } else {
                //  If there was already an activeItem shown then do not need to transition in the new view because one is already fully visible.
                var instant = model.previous('activeItem') !== null;
                this.activeStreamItemRegion.showView(activeItem, instant);
            }
        },
        
        _onStreamItemsAdd: function () {
            this._setState(false);
        },

        _onStreamItemsRemove: function (model, collection) {
            this._setState(collection.isEmpty());
        },

        _onStreamItemsReset: function (collection) {
            this._setState(collection.isEmpty());
        },
        
        //  Hide the empty message if there is anything in the collection
        _setState: function (collectionEmpty) {
            this.ui.emptyMessage.toggleClass('hidden', !collectionEmpty);
        },

        _showSearch: function () {
            Streamus.channels.searchArea.commands.trigger('show:search');
        }
    });

    return StreamView;
});