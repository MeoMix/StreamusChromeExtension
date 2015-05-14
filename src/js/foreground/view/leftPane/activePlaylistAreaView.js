define(function(require) {
    'use strict';

    var Tooltipable = require('foreground/view/behavior/tooltipable');
    var PlaylistItemsView = require('foreground/view/leftPane/playlistItemsView');
    var ActivePlaylistAreaTemplate = require('text!template/leftPane/activePlaylistArea.html');

    var ActivePlaylistAreaView = Marionette.LayoutView.extend({
        id: 'activePlaylistArea',
        className: 'flexColumn',
        template: _.template(ActivePlaylistAreaTemplate),

        templateHelpers: function() {
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

        regions: function() {
            return {
                playlistItemsRegion: '#' + this.id + '-playlistItemsRegion'
            };
        },

        ui: function() {
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
            'click @ui.addAllButton:not(.is-disabled)': '_onClickAddAllButton',
            'click @ui.playAllButton:not(.is-disabled)': '_onClickPlayAllButton'
        },
        
        behaviors: {
            Tooltipable: {
                behaviorClass: Tooltipable
            }
        },

        streamItems: null,
        
        streamItemsEvents: {
            'add:completed': '_onStreamItemsAddCompleted',
            'remove': '_onStreamItemsRemove',
            'reset': '_onStreamItemsReset'
        },
        
        playlistItemsEvents: {
            'add:completed': '_onPlaylistItemsAddCompleted',
            'remove': '_onPlaylistItemsRemove',
            'reset': '_onPlaylistItemsReset'
        },

        initialize: function() {
            this.streamItems = Streamus.backgroundPage.stream.get('items');
            this.bindEntityEvents(this.streamItems, this.streamItemsEvents);

            var playlistItems = this.model.get('items');
            this.bindEntityEvents(playlistItems, this.playlistItemsEvents);
        },

        onRender: function() {
            this._toggleButtons();
            this._updatePlaylistDetails(this.model.get('items').getDisplayInfo());
            this._toggleInstructions(this.model.get('items').isEmpty());

            this.showChildView('playlistItemsRegion', new PlaylistItemsView({
                collection: this.model.get('items')
            }));
        },

        _onClickShowSearchLink: function() {
            Streamus.channels.searchArea.commands.trigger('show:search');
        },

        _onStreamItemsAddCompleted: function() {
            this._toggleButtons();
        },

        _onStreamItemsRemove: function() {
            this._toggleButtons();
        },

        _onStreamItemsReset: function() {
            this._toggleButtons();
        },

        _onPlaylistItemsAddCompleted: function(collection) {
            this._toggleButtons();
            this._updatePlaylistDetails(collection.getDisplayInfo());
            this._toggleInstructions(false);
        },

        _onPlaylistItemsRemove: function(model, collection) {
            this._toggleButtons();
            this._updatePlaylistDetails(collection.getDisplayInfo());
            this._toggleInstructions(collection.isEmpty());
        },

        _onPlaylistItemsReset: function(collection) {
            this._toggleButtons();
            this._updatePlaylistDetails(collection.getDisplayInfo());
            this._toggleInstructions(collection.isEmpty());
        },

        _toggleInstructions: function(collectionEmpty) {
            this.ui.playlistEmptyMessage.toggleClass('is-hidden', !collectionEmpty);
        },

        _toggleButtons: function() {
            var isEmpty = this.model.get('items').isEmpty();
            this.ui.playAllButton.toggleClass('is-disabled', isEmpty);

            var duplicatesInfo = this.streamItems.getDuplicatesInfo(this.model.get('items').pluck('song'));
            this.ui.addAllButton.toggleClass('is-disabled', isEmpty || duplicatesInfo.allDuplicates).attr('data-tooltip-text', isEmpty ? '' : duplicatesInfo.message);
        },

        _updatePlaylistDetails: function(displayInfo) {
            this.ui.playlistDetails.text(displayInfo).attr('data-tooltip-text', displayInfo);
        },

        _onClickAddAllButton: function() {
            this.streamItems.addSongs(this.model.get('items').pluck('song'));
        },

        _onClickPlayAllButton: function() {
            this.streamItems.addSongs(this.model.get('items').pluck('song'), {
                playOnAdd: true
            });
        }
    });

    return ActivePlaylistAreaView;
});