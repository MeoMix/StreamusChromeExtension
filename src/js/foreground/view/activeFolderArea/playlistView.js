define([
    'foreground/view/genericForegroundView',
    'foreground/model/foregroundViewManager',
    'text!template/playlist.html',
    'foreground/collection/contextMenuGroups',
    'foreground/view/prompt/deletePlaylistPromptView',
    'foreground/view/prompt/editPlaylistPromptView',
    'foreground/collection/folders',
    'foreground/collection/streamItems',
    'enum/listItemType'
], function (GenericForegroundView, ForegroundViewManager, PlaylistTemplate, ContextMenuGroups, DeletePlaylistPromptView, EditPlaylistPromptView, Folders, StreamItems, ListItemType) {
    'use strict';

    //  TODO: Starting to integrate MarionetteJS. Need to support better.
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
            'click': 'select',
            'contextmenu': 'showContextMenu',
            'dblclick @ui.titleWrapper': 'startEdit',
            'keyup @ui.editableTitle': 'saveAndStopEditOnEnter'
        },
        
        modelEvents: {
            //  TODO: I don't think I should be calling render from my view anymore.
            'change:title': 'render',
            'change:dataSourceLoaded': 'toggleLoadingClass',
            'change:active': 'stopEditingOnInactive toggleSelectedClass'
        },
        
        ui: {
            itemCount: '.count',
            titleWrapper: '.titleWrapper',
            editableTitle: '.titleWrapper > input',
            readonlyTitle: '.titleWrapper > .title'
        },
        
        //  TODO: instead of passing items into render -- maybe I can just pass in the item count necessary?
        
        //  triggers for contextMenu?
        
        onRender: function() {
            this.toggleLoadingClass();
            this.toggleSelectedClass();

            GenericForegroundView.prototype.initializeTooltips.call(this);
        },

        initialize: function () {
            //  TODO: I think it is OK to listen to this like this... but maybe there's a better way!
            //  Maybe PlaylistView should be a CompositeView since it references a collection of Items?
            this.listenTo(this.model.get('items'), 'add remove', this.updateItemCount);

            //  TODO: Don't do memory management like this -- use regions, I think!
            ForegroundViewManager.get('views').push(this);
        },

        //  TODO: Standardize on active vs selected.
        stopEditingOnInactive: function(model, active) {
            if (!active) {
                this.saveAndStopEdit();
            }
        },
        
        toggleLoadingClass: function () {
            var loading = this.model.has('dataSource') && !this.model.get('dataSourceLoaded');
            this.$el.toggleClass('loading', loading);
        },
        
        //  TODO: Standardize active vs loading.
        toggleSelectedClass: function () {
            var active = this.model.get('active');
            this.$el.toggleClass('selected', active);
        },
        
        updateItemCount: function () {
            var itemCount = this.model.get('items').length;
            this.ui.itemCount.text(itemCount);
        },
        
        select: function () {
            this.model.set('active', true);
        },
        
        showContextMenu: function (event) {

            //  TODO: I don't remember why I need to call event.preventDefault. Comment and move into a trigger.
            event.preventDefault();
            
            ContextMenuGroups.reset();

            var isEmpty = this.model.get('items').length === 0;

            //  Don't allow deleting of the last playlist in a folder.
            var isDeleteDisabled = Folders.get(this.model.get('folderId')).get('playlists').length === 1;

            //  TODO: I don't have a method of reusing ContextMenuItems even though they're used in lots of places.
            var self = this;
            ContextMenuGroups.add({
                items: [{
                    //  No point in sharing an empty playlist.
                    disabled: isEmpty,
                    title: isEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                    text: chrome.i18n.getMessage('copyUrl'),
                    onClick: function () {
                        
                        //  TODO: onClick event should not fire if the item is disabled. I shouldn't have to double-check.
                        if (!isEmpty) {

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

                    }
                }, {
                    text: chrome.i18n.getMessage('delete'),
                    disabled: isDeleteDisabled,
                    title: isDeleteDisabled ? chrome.i18n.getMessage('cantDeleteLastPlaylist') : '',
                    onClick: function () {

                        if (!isDeleteDisabled) {

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
                    }
                }, {
                    text: chrome.i18n.getMessage('enqueue'),
                    disabled: isEmpty,
                    title: isEmpty ? chrome.i18n.getMessage('playlistEmpty') : '',
                    onClick: function () {

                        if (!isEmpty) {
                            StreamItems.addByPlaylistItems(self.model.get('items'), false);
                        }

                    }
                }, {
                    text: chrome.i18n.getMessage('edit'),
                    onClick: function () {

                        var editPlaylistPromptView = new EditPlaylistPromptView({
                            playlist: this.model
                        });

                        editPlaylistPromptView.fadeInAndShow();

                    }
                }]
            });

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