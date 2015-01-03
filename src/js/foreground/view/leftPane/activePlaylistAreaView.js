define([
    'foreground/view/behavior/tooltip',
    'foreground/view/leftPane/playlistItemsView',
    'text!template/leftPane/activePlaylistArea.html'
], function (Tooltip, PlaylistItemsView, ActivePlaylistAreaTemplate) {
    'use strict';

    var ActivePlaylistAreaView = Marionette.LayoutView.extend({
        id: 'activePlaylistArea',
        className: 'column u-flex--column u-flex--full',
        template: _.template(ActivePlaylistAreaTemplate),
        
        templateHelpers: function () {
            return {
                viewId: this.id,
                addAllMessage: chrome.i18n.getMessage('addAll'),
                playAllMessage: chrome.i18n.getMessage('playAll'),
                playlistEmptyMessage: chrome.i18n.getMessage('playlistEmpty'),
                showSearchMessage: chrome.i18n.getMessage('showSearch'),
                searchForSongsMessage: chrome.i18n.getMessage('searchForSongs'),
                wouldYouLikeToMessage: chrome.i18n.getMessage('wouldYouLikeTo')
            };
        },
        
        regions: function () {
            return {
                playlistItemsRegion: '#' + this.id + '-playlistItemsRegion'
            };
        },

        ui: function () {
            return {
                playlistEmptyMessage: '#' + this.id + '-playlistEmptyMessage',
                showSearchLink: '#' + this.id + '-showSearchLink',
                playlistDetails: '#' + this.id + '-playlistDetails',
                playAllButton: '#' + this.id + '-playAllButton',
                addAllButton: '#' + this.id + '-addAllButton'
            };
        },

        events: {
            'click @ui.showSearchLink': '_onClickShowSearchLink',
            'click @ui.addAllButton:not(.disabled)': '_onClickAddAllButton',
            'click @ui.playAllButton:not(.disabled)': '_onClickPlayAllButton'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        streamItems: null,
        
        initialize: function() {
            this.streamItems = Streamus.backgroundPage.stream.get('items');
            this.listenTo(this.streamItems, 'add', this._onStreamItemsAdd);
            this.listenTo(this.streamItems, 'remove', this._onStreamItemsRemove);
            this.listenTo(this.streamItems, 'reset', this._onStreamItemsReset);

            var playlistItems = this.model.get('items');
            this.listenTo(playlistItems, 'add', this._onPlaylistItemsAdd);
            this.listenTo(playlistItems, 'remove', this._onPlaylistItemsRemove);
            this.listenTo(playlistItems, 'reset', this._onPlaylistItemsReset);
        },

        onRender: function () {
            this._toggleButtons();
            this._updatePlaylistDetails(this.model.get('items').getDisplayInfo());
            this._toggleInstructions(this.model.get('items').isEmpty());
        },
        
        onShow: function () {
            this.playlistItemsRegion.show(new PlaylistItemsView({
                collection: this.model.get('items')
            }));
        },
        
        _onClickShowSearchLink: function () {
            Streamus.channels.searchArea.commands.trigger('show:search');
        },
        
        _onStreamItemsAdd: function () {
            this._toggleButtons();
        },
        
        _onStreamItemsRemove: function() {
            this._toggleButtons();
        },
        
        _onStreamItemsReset: function () {
            this._toggleButtons();
        },
        
        _onPlaylistItemsAdd: function(model, collection) {
            this._toggleButtons();
            this._updatePlaylistDetails(collection.getDisplayInfo());
            this._toggleInstructions(false);
        },
        
        _onPlaylistItemsRemove: function (model, collection) {
            this._toggleButtons();
            this._updatePlaylistDetails(collection.getDisplayInfo());
            this._toggleInstructions(collection.isEmpty());
        },
        
        _onPlaylistItemsReset: function (collection) {
            this._toggleButtons();
            this._updatePlaylistDetails(collection.getDisplayInfo());
            this._toggleInstructions(collection.isEmpty());
        },
        
        _toggleInstructions: function (collectionEmpty) {
            this.ui.playlistEmptyMessage.toggleClass('hidden', !collectionEmpty);
        },
        
        _toggleButtons: function () {
            var isEmpty = this.model.get('items').isEmpty();
            this.ui.playAllButton.toggleClass('disabled', isEmpty);

            var duplicatesInfo = this.streamItems.getDuplicatesInfo(this.model.get('items').pluck('song'));
            this.ui.addAllButton.toggleClass('disabled', isEmpty || duplicatesInfo.allDuplicates).attr('title', isEmpty ? '' : duplicatesInfo.message);
        },

        _updatePlaylistDetails: function (displayInfo) {
            this.ui.playlistDetails.text(displayInfo);
        },

        _onClickAddAllButton: function () {
            this.streamItems.addSongs(this.model.get('items').pluck('song'));
        },
        
        _onClickPlayAllButton: function () {
            this.streamItems.addSongs(this.model.get('items').pluck('song'), {
                playOnAdd: true
            });
        }
    });

    return ActivePlaylistAreaView;
});