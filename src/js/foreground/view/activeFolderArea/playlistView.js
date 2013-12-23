define([
    'foreground/view/genericForegroundView',
    'text!template/playlist.html',
    'foreground/collection/contextMenuGroups',
    'foreground/view/genericPromptView',
    'foreground/view/deletePlaylistView',
    'foreground/view/editPlaylistView',
    'foreground/model/settings',
    'foreground/collection/folders'
], function (GenericForegroundView, PlaylistTemplate, ContextMenuGroups, GenericPromptView, DeletePlaylistView, EditPlaylistView, Settings, Folders) {
    'use strict';

    var PlaylistView = GenericForegroundView.extend({
        tagName: 'li',

        className: 'playlist',

        template: _.template(PlaylistTemplate),
        
        itemCount: null,
        editableTitle: null,
        readonlyTitle: null,

        attributes: function () {
            return {
                'data-playlistid': this.model.get('id')
            };
        },
        
        events: {
            'click': 'select',
            'dblclick .titleWrapper': 'edit',
            'blur input.editableTitle': 'saveAndStopEdit',
            'keyup input.editableTitle': 'saveAndStopEditOnEnter',
            'contextmenu': 'showContextMenu'
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            this.$el.toggleClass('loading', this.model.has('dataSource') && !this.model.get('dataSourceLoaded'));
            
            this.setSelectedClass();
            
            this.itemCount = this.$el.find('.count');

            this.editableTitle = this.$el.find('.titleWrapper > input');
            this.readonlyTitle = this.$el.find('.titleWrapper > .title');

            return this;
        },

        initialize: function () {
            this.listenTo(this.model, 'change:title change:dataSourceLoaded', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'change:active', function(model, active) {

                if (!active) {
                    this.saveAndStopEdit();
                }

                this.setSelectedClass();

            });

            this.listenTo(this.model.get('items'), 'add remove', this.updateItemCount);
        },
        
        setSelectedClass: function() {
            this.$el.toggleClass('selected', this.model.get('active'));
        },
        
        updateItemCount: function() {
            this.itemCount.text(this.model.get('items').length);
        },
        
        select: function () {
            this.model.set('active', true);
        },
        
        showContextMenu: function (event) {

            event.preventDefault();
            ContextMenuGroups.reset();

            var isEmpty = this.model.get('items').length === 0;

            //  Don't allow deleting of the last playlist in a folder ( at least for now )
            var isDeleteDisabled = Folders.get(this.model.get('folderId')).get('playlists').length === 1;

            var self = this;
            ContextMenuGroups.add({
                items: [{
                    //  No point in sharing an empty playlist...
                    disabled: isEmpty,
                    title: isEmpty ? chrome.i18n.getMessage('sharePlaylistNoShareWarning') : '',
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
                    title: isDeleteDisabled ? chrome.i18n.getMessage('deletePlaylistDisabled') : '',
                    onClick: function () {

                        if (!isDeleteDisabled) {

                            //  No need to notify if the playlist is empty.
                            if (self.model.get('items').length === 0) {
                                self.model.destroy();
                            } else {

                                var remindDeletePlaylist = Settings.get('remindDeletePlaylist');
                                if (remindDeletePlaylist) {

                                    var deletePlaylistPromptView = new GenericPromptView({
                                        title: chrome.i18n.getMessage('deletePlaylist'),
                                        okButtonText: chrome.i18n.getMessage('deleteButtonText'),
                                        model: new DeletePlaylistView({
                                            model: self.model
                                        })
                                    });

                                    deletePlaylistPromptView.fadeInAndShow();

                                } else {
                                    self.model.destroy();
                                }


                            }

                        }
                    }
                }, {
                    text: chrome.i18n.getMessage('addPlaylistToStream'),
                    disabled: isEmpty,
                    title: isEmpty ? chrome.i18n.getMessage('noAddStreamWarning') : '',
                    onClick: function () {

                        if (!isEmpty) {

                            var streamItems = self.model.get('items').map(function (playlistItem) {
                                return {
                                    id: _.uniqueId('streamItem_'),
                                    video: playlistItem.get('video'),
                                    title: playlistItem.get('title')
                                };
                            });

                            StreamItems.addMultiple(streamItems);
                        }

                    }
                }, {
                    text: chrome.i18n.getMessage('edit'),
                    onClick: function () {

                        var editPlaylistPromptView = new GenericPromptView({
                            title: chrome.i18n.getMessage('editPlaylist'),
                            okButtonText: chrome.i18n.getMessage('saveButtonText'),
                            model: new EditPlaylistView({
                                model: self.model
                            })
                        });

                        editPlaylistPromptView.fadeInAndShow();

                    }
                }]
            });

        },
        
        edit: function() {
            this.editableTitle.show();
            this.readonlyTitle.hide();
        },
        
        saveAndStopEditOnEnter: function(event) {
            if (event.which === 13) {
                this.saveAndStopEdit();
            }
        },
        
        saveAndStopEdit: function () {
            var newTitle = $.trim(this.editableTitle.val());
            if (newTitle !== '') {
                this.model.set('title', newTitle);
            }

            this.editableTitle.hide();
            this.readonlyTitle.show();
        }

    });

    return PlaylistView;
});