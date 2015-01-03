define([
    'common/enum/listItemType',
    'foreground/model/playlistAction',
    'foreground/view/element/spinnerView',
    'foreground/view/listItemView',
    'foreground/view/listItemButton/addPlaylistButtonView',
    'foreground/view/listItemButton/deletePlaylistButtonView',
    'foreground/view/listItemButton/playPlaylistButtonView',
    'foreground/view/prompt/editPlaylistPromptView',
    'foreground/view/prompt/exportPlaylistPromptView',
    'text!template/playlist/playlist.html'
], function (ListItemType, PlaylistAction, SpinnerView, ListItemView, AddPlaylistButtonView, DeletePlaylistButtonView, PlayPlaylistButtonView, EditPlaylistPromptView, ExportPlaylistPromptView, PlaylistTemplate) {
    'use strict';

    var PlaylistView = ListItemView.extend({
        className: ListItemView.prototype.className + ' playlist listItem--small listItem--hasButtons listItem--selectable',
        template: _.template(PlaylistTemplate),
        
        ui: _.extend({}, ListItemView.prototype.ui, {
            title: '.listItem-title',
            itemCount: '.listItem-itemCount'  
        }),

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
        
        initialize: function () {
            var playlistItems = this.model.get('items');
            this.listenTo(playlistItems, 'add', this._onPlaylistItemsAdd);
            this.listenTo(playlistItems, 'remove', this._onPlaylistItemsRemove);
            this.listenTo(playlistItems, 'reset', this._onPlaylistItemsReset);
        },
        
        onRender: function () {
            this.spinnerRegion.show(new SpinnerView({
                className: 'overlay u-marginAuto'
            }));

            this._setShowingSpinnerClass();
            this._setActiveClass(this.model.get('active'));
            this._setItemCount(this.model.get('items').length);
        },
        
        showContextMenu: function () {
            var isEmpty = this.model.get('items').isEmpty();

            Streamus.channels.contextMenu.commands.trigger('reset:items', [{
                text: chrome.i18n.getMessage('edit'),
                onClick: this._showEditPlaylistPrompt.bind(this)
            }, {
                //  No point in sharing an empty playlist.
                disabled: isEmpty,
                text: chrome.i18n.getMessage('copyUrl'),
                onClick: this._copyPlaylistUrl.bind(this)
            }, {
                //  No point in exporting an empty playlist.
                disabled: isEmpty,
                text: chrome.i18n.getMessage('export'),
                onClick: this._showExportPlaylistPrompt.bind(this)
            }]);
        },
        
        _onChangeTitle: function (model, title) {
            this.ui.title.text(title).attr('title', title);
        },
        
        _onChangeDataSourceLoaded: function () {
            this._setShowingSpinnerClass();
        },
        
        _onChangeId: function () {
            this._setShowingSpinnerClass();
        },
        
        _onChangeActive: function (model, active) {
            this._setActiveClass(active);
        },
        
        _setShowingSpinnerClass: function () {
            var loading = this.model.isLoading();
            var saving = this.model.isNew();
            this.$el.toggleClass('is-showingSpinner', loading || saving);
        },
        
        _setActiveClass: function (active) {
            this.$el.toggleClass('is-active', active);
        },
        
        _onPlaylistItemsAdd: function (model, collection) {
            this._setItemCount(collection.length);
        },

        _onPlaylistItemsRemove: function (model, collection) {
            this._setItemCount(collection.length);
        },

        _onPlaylistItemsReset: function (collection) {
            this._setItemCount(collection.length);
        },
        
        _setItemCount: function (itemCount) {
            //  Format the number if it is too large.
            if (itemCount >= 1000) {
                itemCount = Math.floor(itemCount / 1000) + 'K';
            }
            
            this.ui.itemCount.text(itemCount);
        },
        
        _activate: function () {
            this.model.set('active', true);
        },
        
        _copyPlaylistUrl: function() {
            this.model.getShareCode({
                success: this._onGetShareCodeSuccess,
                error: this._onGetShareCodeError
            });
        },
        
        _onGetShareCodeSuccess: function (shareCode) {
            shareCode.copyUrl();
            
            Streamus.channels.notification.commands.trigger('show:notification', {
                message: chrome.i18n.getMessage('urlCopied')
            });
        },
        
        _onGetShareCodeError: function () {
            Streamus.channels.notification.commands.trigger('show:notification', {
                message: chrome.i18n.getMessage('copyFailed')
            });

            Streamus.backgroundChannels.error.commands.trigger('log:error', new Error('Failed to get sharecode; ' + ' playlist: ' + this.model.get('id')));
        },
        
        _showEditPlaylistPrompt: function() {
            Streamus.channels.prompt.commands.trigger('show:prompt', EditPlaylistPromptView, {
                playlist: this.model
            });
        },
        
        _showExportPlaylistPrompt: function() {
            Streamus.channels.prompt.commands.trigger('show:prompt', ExportPlaylistPromptView, {
                playlist: this.model
            });
        },
        
        _onClick: function () {
            this._activate();
        },
        
        _onDblClick: function () {
            this._activate();
        }
    });

    return PlaylistView;
});