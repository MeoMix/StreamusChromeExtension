define([
    'text!template/playlist.html',
    'foreground/collection/contextMenuItems',
    'foreground/view/prompt/deletePlaylistPromptView',
    'foreground/view/prompt/editPlaylistPromptView',
    'background/collection/playlists',
    'background/collection/streamItems',
    'common/enum/listItemType'
], function (PlaylistTemplate, ContextMenuItems, DeletePlaylistPromptView, EditPlaylistPromptView, Playlists, StreamItems, ListItemType) {
    'use strict';

    var PlaylistView = Backbone.Marionette.ItemView.extend({
        tagName: 'li',

        className: 'listItem playlist',

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
            'dblclick @ui.readonlyTitle': 'startEdit',
            'keyup @ui.editableTitle': 'saveAndStopEditOnEnter'
        },
        
        modelEvents: {
            'change:title': 'updateTitle',
            'change:dataSourceLoaded': 'setLoadingClass',
            'change:active': 'stopEditingOnInactive setActiveClass'
        },
        
        ui: {
            itemCount: '.count',
            editableTitle: 'input.editableTitle',
            readonlyTitle: 'span.title'
        },
        
        onRender: function() {
            this.setLoadingClass();
            this.setActiveClass();
            this.applyTooltips();
        },

        initialize: function () {
            this.listenTo(this.model.get('items'), 'add remove', this.updateItemCount);
        },
        
        updateTitle: function () {
            this.ui.readonlyTitle.text(this.model.get('title'));
            this.applyTooltips();
        },

        stopEditingOnInactive: function(model, active) {
            if (!active) {
                this.saveAndStopEdit();
            }
        },
        
        setLoadingClass: function () {
            var loading = this.model.has('dataSource') && !this.model.get('dataSourceLoaded');
            this.$el.toggleClass('loading', loading);
        },
        
        setActiveClass: function () {
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

            var self = this;
            ContextMenuItems.reset([{
                    //  No point in sharing an empty playlist.
                    disabled: isEmpty,
                    title: isEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                    text: chrome.i18n.getMessage('copyUrl'),
                    onClick: function () {
                        
                        self.model.getShareCode(function (shareCode) {

                            var shareCodeShortId = shareCode.get('shortId');
                            var urlFriendlyEntityTitle = shareCode.get('urlFriendlyEntityTitle');

                            var playlistShareUrl = 'http://share.streamus.com/playlist/' + shareCodeShortId + '/' + urlFriendlyEntityTitle;

                            chrome.extension.sendMessage({
                                method: 'copy',
                                text: playlistShareUrl
                            });

                        });
                            
                    }
                }, {
                    text: chrome.i18n.getMessage('delete'),
                    disabled: isDeleteDisabled,
                    title: isDeleteDisabled ? chrome.i18n.getMessage('cantDeleteLastPlaylist') : '',
                    onClick: function () {
                        //  No need to notify if the playlist is empty.
                        if (self.model.get('items').length === 0) {
                            self.model.destroy();
                        } else {

                            var deletePlaylistPromptView = new DeletePlaylistPromptView({
                                playlist: self.model
                            });

                            //  TODO: This doesn't convey the fact that it checks a reminder to determine whether to show.
                            deletePlaylistPromptView.fadeInAndShow();
                        }
                    }
                }, {
                    text: chrome.i18n.getMessage('add'),
                    disabled: isEmpty,
                    title: isEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                    onClick: function () {
                        StreamItems.addByPlaylistItems(self.model.get('items'), false);
                    }
                }, {
                    text: chrome.i18n.getMessage('edit'),
                    onClick: function () {

                        var editPlaylistPromptView = new EditPlaylistPromptView({
                            playlist: self.model
                        });

                        editPlaylistPromptView.fadeInAndShow();

                    }
                }]
            );

        },
        
        startEdit: function () {
            //  Reset val after focusing to prevent selecting the text while maintaining focus.
            this.ui.editableTitle.show().focus().val(this.ui.editableTitle.val());
            this.ui.readonlyTitle.hide();
        },
        
        saveAndStopEditOnEnter: function(event) {
            if (event.which === 13) {
                this.saveAndStopEdit();
            }
        },
        
        saveAndStopEdit: function () {
            //  TODO: This fails silently if an invalid title is provided and it does not enforce a max length.
            var newTitle = $.trim(this.ui.editableTitle.val());
            if (newTitle !== '') {
                this.model.set('title', newTitle);
            }

            this.ui.editableTitle.hide();
            this.ui.readonlyTitle.show();
        }

    });

    return PlaylistView;
});