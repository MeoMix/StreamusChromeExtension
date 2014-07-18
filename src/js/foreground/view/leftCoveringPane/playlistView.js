define([
    'common/enum/listItemType',
    'foreground/collection/contextMenuItems',
    'foreground/model/contextMenuActions',
    'foreground/view/behavior/tooltip',
    'foreground/view/prompt/deletePlaylistPromptView',
    'foreground/view/prompt/editPlaylistPromptView',
    'text!template/playlist.html'
], function (ListItemType, ContextMenuItems, ContextMenuActions, Tooltip, DeletePlaylistPromptView, EditPlaylistPromptView, PlaylistTemplate) {
    'use strict';

    var Playlists = chrome.extension.getBackgroundPage().Playlists;

    var PlaylistView = Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        className: 'list-item playlist',
        template: _.template(PlaylistTemplate),

        attributes: function () {
            return {
                'data-id': this.model.get('id'),
                'data-type': ListItemType.Playlist
            };
        },
        
        events: {
            'blur @ui.editableTitle': 'saveAndStopEdit',
            'click': 'activate',
            'contextmenu': 'showContextMenu',
            'dblclick @ui.title': 'startEdit',
            'keyup @ui.editableTitle': 'saveAndStopEditOnEnter'
        },
        
        modelEvents: {
            'change:title': 'updateTitle',
            'change:dataSourceLoaded': 'setLoadingClass',
            'change:active': 'stopEditingOnInactive _setActiveClass'
        },
        
        ui: {
            itemCount: '.count',
            editableTitle: '.editable-title',
            title: '.title'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },

        onRender: function () {
            this.setLoadingClass();
            this._setActiveClass();
        },
        
        initialize: function () {
            this.listenTo(this.model.get('items'), 'add remove', this.updateItemCount);
        },
        
        updateTitle: function () {
            var title = this.model.get('title');
            this.ui.title.text(title).attr('title', title);
        },

        stopEditingOnInactive: function (model, active) {
            if (!active) {
                this.saveAndStopEdit();
            }
        },
        
        setLoadingClass: function () {
            var loading = this.model.has('dataSource') && !this.model.get('dataSourceLoaded');
            this.$el.toggleClass('loading', loading);
        },
        
        _setActiveClass: function () {
            var active = this.model.get('active');
            this.$el.toggleClass('active', active);
        },
        
        updateItemCount: function () {
            var itemCount = this.model.get('items').length;
            this.ui.itemCount.text(itemCount);
        },
        
        activate: function () {
            this.model.set('active', true);
        },
        
        showContextMenu: function (event) {
            //  Allow the editableInput to use default contextmenu, feels right.
            if ($(event.target).is(this.ui.editableTitle)) {
                return true;
            }

            event.preventDefault();
            
            var isEmpty = this.model.get('items').length === 0;

            //  Don't allow deleting of the last playlist.
            var isDeleteDisabled = Playlists.length === 1;

            ContextMenuItems.reset([{
                    //  No point in sharing an empty playlist.
                    disabled: isEmpty,
                    title: isEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                    text: chrome.i18n.getMessage('copyUrl'),
                    onClick: this._copyPlaylistUrl.bind(this)
                }, {
                    text: chrome.i18n.getMessage('delete'),
                    disabled: isDeleteDisabled,
                    title: isDeleteDisabled ? chrome.i18n.getMessage('cantDeleteLastPlaylist') : '',
                    onClick: this._showDeletePlaylistPrompt.bind(this)
                }, {
                    text: chrome.i18n.getMessage('add'),
                    disabled: isEmpty,
                    title: isEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                    onClick: this._addSongsToStream.bind(this)
                }, {
                    text: chrome.i18n.getMessage('edit'),
                    onClick: this._showEditPlaylistPrompt.bind(this)
                }]
            );

        },
        
        _copyPlaylistUrl: function() {
            this.model.getShareCode(function (shareCode) {
                var shareCodeShortId = shareCode.get('shortId');
                var urlFriendlyEntityTitle = shareCode.get('urlFriendlyEntityTitle');
                var playlistShareUrl = 'http://share.streamus.com/playlist/' + shareCodeShortId + '/' + urlFriendlyEntityTitle;

                chrome.extension.sendMessage({
                    method: 'copy',
                    text: playlistShareUrl
                });
            });
        },
        
        _showEditPlaylistPrompt: function() {
            Wreqr.radio.channel('prompt').vent.trigger('show', EditPlaylistPromptView, {
                playlist: this.model
            });
        },
        
        _showDeletePlaylistPrompt: function() {
            //  No need to notify if the playlist is empty.
            if (this.model.get('items').length === 0) {
                this.model.destroy();
            } else {
                Wreqr.radio.channel('prompt').vent.trigger('show', DeletePlaylistPromptView, {
                    playlist: this.model
                });
            }
        },
        
        _addSongsToStream: function () {
            ContextMenuActions.addSongsToStream(this.model.get('items').pluck('song'));
        },
        
        startEdit: function () {
            //  Reset val after focusing to prevent selecting the text while maintaining focus.
            this.ui.title.hide();
            this.ui.editableTitle.show().focus().val(this.ui.editableTitle.val());
        },
        
        saveAndStopEditOnEnter: function(event) {
            if (event.which === 13) {
                this.saveAndStopEdit();
            }
        },
        
        saveAndStopEdit: function () {
            this.ui.editableTitle.hide();
            //  Be sure to show the title before changing it's text so the tooltip can know whether it is overflowing or not.
            this.ui.title.show();
            
            //  TODO: This fails silently if an invalid title is provided and it does not enforce a max length.
            var newTitle = $.trim(this.ui.editableTitle.val());
            if (newTitle !== '') {
                this.model.set('title', newTitle);
            }
        }
    });

    return PlaylistView;
});