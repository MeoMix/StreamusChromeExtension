define([
    'common/enum/listItemType',
    'common/enum/notificationType',
    'foreground/model/playlistAction',
    'foreground/view/listItemView',
    'foreground/view/listItemButton/addPlaylistButtonView',
    'foreground/view/listItemButton/deletePlaylistButtonView',
    'foreground/view/listItemButton/playPlaylistButtonView',
    'foreground/view/prompt/deletePlaylistPromptView',
    'foreground/view/prompt/editPlaylistPromptView',
    'foreground/view/prompt/exportPlaylistPromptView',
    'text!template/playlist/playlist.html'
], function (ListItemType, NotificationType, PlaylistAction, ListItemView, AddPlaylistButtonView, DeletePlaylistButtonView, PlayPlaylistButtonView, DeletePlaylistPromptView, EditPlaylistPromptView, ExportPlaylistPromptView, PlaylistTemplate) {
    'use strict';

    var PlaylistView = ListItemView.extend({
        className: ListItemView.prototype.className + ' playlist listItem--indented listItem--small',
        template: _.template(PlaylistTemplate),
        
        templateHelpers: function () {
            return {
                itemCount: this._getItemCount()
            };
        },
        
        ui: _.extend({}, ListItemView.prototype.ui, {
            title: '.listItem-title',
            itemCount: '.listItem-itemCount'  
        }),

        events: _.extend({}, ListItemView.prototype.events, {
            'click': '_onClick',
            'dblclick': '_onDblClick'
        }),
        
        modelEvents: {
            'change:title': '_updateTitle',
            'change:dataSourceLoaded': '_setShowingSpinnerClass',
            'change:active': '_setActiveClass',
            'change:id': '_setShowingSpinnerClass'
        },
        
        buttonViews: [PlayPlaylistButtonView, AddPlaylistButtonView, DeletePlaylistButtonView],
        
        streamItems: null,
        
        initialize: function () {
            this.streamItems = Streamus.backgroundPage.StreamItems;

            this.listenTo(this.model.get('items'), 'add remove reset', this._onItemCountChanged);
        },
        
        onRender: function () {
            this._setShowingSpinnerClass();
            this._setActiveClass();
        },
        
        _updateTitle: function () {
            var title = this.model.get('title');
            this.ui.title.text(title).attr('title', title);
        },
        
        _setShowingSpinnerClass: function () {
            var loading = this.model.has('dataSource') && !this.model.get('dataSourceLoaded');
            var saving = this.model.isNew();
            this.$el.toggleClass('is-showingSpinner', loading || saving);
        },
        
        _setActiveClass: function () {
            var active = this.model.get('active');
            this.$el.toggleClass('is-active', active);
        },
        
        _onItemCountChanged: function() {
            this._updateItemCount();
        },
        
        _updateItemCount: function () {
            var itemCount = this._getItemCount();
            this.ui.itemCount.text(itemCount);
        },
        
        _getItemCount: function() {
            var itemCount = this.model.get('items').length;

            if (itemCount >= 1000) {
                itemCount = Math.floor(itemCount / 1000) + 'K';
            }

            return itemCount;
        },
        
        _activate: function () {
            this.model.set('active', true);
        },
        
        _showContextMenu: function (event) {
            event.preventDefault();
            
            var isEmpty = this.model.get('items').length === 0;
            var canDelete = this.model.get('canDelete');

            Streamus.channels.contextMenu.commands.trigger('reset:items', [{
                    text: chrome.i18n.getMessage('edit'),
                    onClick: this._showEditPlaylistPrompt.bind(this)
                },{
                    //  No point in sharing an empty playlist.
                    disabled: isEmpty,
                    title: isEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                    text: chrome.i18n.getMessage('copyUrl'),
                    onClick: this._copyPlaylistUrl.bind(this)
                }, {
                    //  No point in exporting an empty playlist.
                    disabled: isEmpty,
                    title: isEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                    text: chrome.i18n.getMessage('export'),
                    onClick: this._showExportPlaylistPrompt.bind(this)
                }, {
                    text: chrome.i18n.getMessage('delete'),
                    disabled: !canDelete,
                    title: !canDelete ? chrome.i18n.getMessage('cantDeleteLastPlaylist') : '',
                    onClick: this._showDeletePlaylistPrompt.bind(this)
                }, {
                    text: chrome.i18n.getMessage('add'),
                    disabled: isEmpty,
                    title: isEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                    onClick: this._addSongsToStream.bind(this)
                }]
            );
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
                type: NotificationType.Success,
                //  TODO: i18n
                message: 'URL copied to clipboard successfully.'
            });
        },
        
        _onGetShareCodeError: function () {
            var errorMessage = 'Failed to copy URL to clipboard.';

            Streamus.channels.notification.commands.trigger('show:notification', {
                type: NotificationType.Error,
                //  TODO: i18n
                message: errorMessage
            });

            var error = new Error(errorMessage + ' playlist: ' + JSON.stringify(this.model));
            Streamus.backgroundChannels.error.commands.trigger('log:error', error);
        },
        
        _showEditPlaylistPrompt: function() {
            Streamus.channels.prompt.commands.trigger('show:prompt', EditPlaylistPromptView, {
                playlist: this.model
            });
        },
        
        _showDeletePlaylistPrompt: function () {
            var playlistAction = new PlaylistAction({
                playlist: this.model
            });
            
            playlistAction.deletePlaylist();
        },
        
        _showExportPlaylistPrompt: function() {
            Streamus.channels.prompt.commands.trigger('show:prompt', ExportPlaylistPromptView, {
                playlist: this.model
            });
        },
        
        _addSongsToStream: function () {
            this.streamItems.addSongs(this.model.get('items').pluck('song'));
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