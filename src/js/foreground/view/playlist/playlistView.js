define(function(require) {
    'use strict';

    var SpinnerView = require('foreground/view/element/spinnerView');
    var ListItemView = require('foreground/view/listItemView');
    var AddPlaylistButtonView = require('foreground/view/listItemButton/addPlaylistButtonView');
    var DeletePlaylistButtonView = require('foreground/view/listItemButton/deletePlaylistButtonView');
    var PlayPlaylistButtonView = require('foreground/view/listItemButton/playPlaylistButtonView');
    var EditPlaylistDialogView = require('foreground/view/dialog/editPlaylistDialogView');
    var ExportPlaylistDialogView = require('foreground/view/dialog/exportPlaylistDialogView');
    var PlaylistTemplate = require('text!template/playlist/playlist.html');

    var PlaylistView = ListItemView.extend({
        className: ListItemView.prototype.className + ' playlist listItem--small listItem--hasButtons listItem--selectable',
        template: _.template(PlaylistTemplate),

        ui: {
            title: '.listItem-title',
            itemCount: '.listItem-itemCount'
        },

        events: _.extend({}, ListItemView.prototype.events, {
            'click': '_onClick',
            'dblclick': '_onDblClick'
        }),

        modelEvents: {
            'change:title': '_onChangeTitle',
            'change:dataSourceLoaded': '_onChangeDataSourceLoaded',
            'change:active': '_onChangeActive',
            'change:id': '_onChangeId'
        },

        buttonViews: [PlayPlaylistButtonView, AddPlaylistButtonView, DeletePlaylistButtonView],

        playlistItemsEvents: {
            'add:completed': '_onPlaylistItemsAddCompleted',
            'remove': '_onPlaylistItemsRemove',
            'reset': '_onPlaylistItemsReset'
        },

        initialize: function() {
            this.bindEntityEvents(this.model.get('items'), this.playlistItemsEvents);
        },

        onRender: function() {
            //  TODO: Don't incur this load unless needed.
            this.showChildView('spinnerRegion', new SpinnerView({
                className: 'overlay u-marginAuto'
            }));

            this._setShowingSpinnerClass();
            this._setActiveClass(this.model.get('active'));
            this._setItemCount(this.model.get('items').length);
            //  TODO: Ensure that the playlist scrolls into view -- but I need to create it as active I think because I don't ALWAYS want to scroll to the active item.
        },

        showContextMenu: function() {
            var isEmpty = this.model.get('items').isEmpty();

            Streamus.channels.contextMenu.commands.trigger('reset:items', [{
                text: chrome.i18n.getMessage('edit'),
                onClick: this._showEditPlaylistDialog.bind(this)
            }, {
                //  No point in sharing an empty playlist.
                disabled: isEmpty,
                text: chrome.i18n.getMessage('copyUrl'),
                onClick: this._copyPlaylistUrl.bind(this)
            }, {
                //  No point in exporting an empty playlist.
                disabled: isEmpty,
                text: chrome.i18n.getMessage('export'),
                onClick: this._showExportPlaylistDialog.bind(this)
            }]);
        },

        _onChangeTitle: function(model, title) {
            this.ui.title.text(title).attr('title', title);
        },

        _onChangeDataSourceLoaded: function() {
            this._setShowingSpinnerClass();
        },

        _onChangeId: function() {
            this._setShowingSpinnerClass();
        },

        _onChangeActive: function(model, active) {
            this._setActiveClass(active);
        },

        _setShowingSpinnerClass: function() {
            var loading = this.model.isLoading();
            var saving = this.model.isNew();
            this.$el.toggleClass('is-showingSpinner', loading || saving);
        },

        _setActiveClass: function(active) {
            this.$el.toggleClass('is-active', active);
        },

        _onPlaylistItemsAddCompleted: function(collection) {
            this._setItemCount(collection.length);
        },

        _onPlaylistItemsRemove: function(model, collection) {
            this._setItemCount(collection.length);
        },

        _onPlaylistItemsReset: function(collection) {
            this._setItemCount(collection.length);
        },

        _setItemCount: function(itemCount) {
            //  Format the number if it is too large.
            if (itemCount >= 1000) {
                itemCount = Math.floor(itemCount / 1000) + 'K';
            }

            this.ui.itemCount.text(itemCount);
        },

        _activate: function() {
            this.model.set('active', true);
        },

        _copyPlaylistUrl: function() {
            this.model.getShareCode({
                success: this._onGetShareCodeSuccess,
                error: this._onGetShareCodeError
            });
        },

        _onGetShareCodeSuccess: function(shareCode) {
            shareCode.copyUrl();

            Streamus.channels.notification.commands.trigger('show:notification', {
                message: chrome.i18n.getMessage('urlCopied')
            });
        },

        _onGetShareCodeError: function() {
            Streamus.channels.notification.commands.trigger('show:notification', {
                message: chrome.i18n.getMessage('copyFailed')
            });

            Streamus.backgroundChannels.error.commands.trigger('log:error', new Error('Failed to get sharecode; ' + ' playlist: ' + this.model.get('id')));
        },

        _showEditPlaylistDialog: function() {
            Streamus.channels.dialog.commands.trigger('show:dialog', EditPlaylistDialogView, {
                playlist: this.model
            });
        },

        _showExportPlaylistDialog: function() {
            Streamus.channels.dialog.commands.trigger('show:dialog', ExportPlaylistDialogView, {
                playlist: this.model
            });
        },

        _onClick: function() {
            this._activate();
        },

        _onDblClick: function() {
            this._activate();
        }
    });

    return PlaylistView;
});