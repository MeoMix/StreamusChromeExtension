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
        
        templateHelpers:{
            addAllMessage: chrome.i18n.getMessage('addAll'),
            playAllMessage: chrome.i18n.getMessage('playAll')
        },
        
        regions: function () {
            return {
                playlistItemsRegion: '#' + this.id + '-playlistItemsRegion'
            };
        },

        ui: function () {
            return {
                playlistDetails: '#' + this.id + '-playlistDetails',
                playAllButton: '#' + this.id + '-playAllButton',
                addAllButton: '#' + this.id + '-addAllButton'
            };
        },

        events: {
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
        },
        
        onShow: function () {
            this.playlistItemsRegion.show(new PlaylistItemsView({
                collection: this.model.get('items')
            }));
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
        },
        
        _onPlaylistItemsRemove: function (model, collection) {
            this._toggleButtons();
            this._updatePlaylistDetails(collection.getDisplayInfo());
        },
        
        _onPlaylistItemsReset: function (collection) {
            this._toggleButtons();
            this._updatePlaylistDetails(collection.getDisplayInfo());
        },
        
        _toggleButtons: function () {
            var isEmpty = this.model.get('items').isEmpty();
            this.ui.playAllButton.toggleClass('disabled', isEmpty);

            var duplicatesInfo = this.streamItems.getDuplicatesInfo(this.model.get('items').pluck('song'));
            this.ui.addAllButton.toggleClass('disabled', isEmpty || duplicatesInfo.allDuplicates).attr('title', duplicatesInfo.message);
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