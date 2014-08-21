define([
    'common/enum/listItemType',
    'foreground/view/createPlaylistView',
    'foreground/view/behavior/tooltip',
    'foreground/view/leftCoveringPane/playlistView',
    'foreground/view/prompt/createPlaylistPromptView',
    'foreground/view/prompt/deletePlaylistPromptView',
    'foreground/view/prompt/editPlaylistPromptView',
    'text!template/playlistsArea.html'
], function (ListItemType, CreatePlaylistView, Tooltip, PlaylistView, CreatePlaylistPromptView, DeletePlaylistPromptView, EditPlaylistPromptView, PlaylistsAreaTemplate) {
    'use strict';

    var SignInManager = Streamus.backgroundPage.SignInManager;

    var PlaylistsAreaView = Backbone.Marionette.CompositeView.extend({
        className: 'playlists-area fixed-full-overlay',
        template: _.template(PlaylistsAreaTemplate),
        childView: PlaylistView,
        childViewContainer: '@ui.childContainer',
        
        //  Overwrite resortView to only render children as expected
        resortView: function () {
            this._renderChildren();
        },

        events: {
            'click': '_hideIfClickOutsidePanel',
            'click @ui.hideButton': '_hide',
            'click @ui.addButton': '_showCreatePlaylistPrompt',
            'click @ui.editButton': '_showEditActivePlaylistPrompt',
            'click @ui.deleteButton:not(.disabled)': '_showDeleteActivePlaylistPrompt',
            'dblclick @ui.childContainer': '_onDblClickChildContainer'
        },
        
        collectionEvents: {
            'add remove reset': '_setDeleteButtonState'
        },
        
        ui: {
            buttons: '.button-icon',
            panel: '.panel',
            childContainer: '.playlists',
            contextButtons: '.context-buttons',
            deleteButton: '#delete-playlist-button',
            addButton: '.add',
            hideButton: '.hide',
            editButton: '.edit',
            textTooltipable: '.text-tooltipable'
        },
        
        templateHelpers: {
            playlists: chrome.i18n.getMessage('playlists'),
            createPlaylist: chrome.i18n.getMessage('createPlaylist'),
            editPlaylist: chrome.i18n.getMessage('editPlaylist')
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },

        initialize: function () {
            //  Don't show playlist actions if SignInManager isn't signedIn because won't be able to save reliably.
            this.listenTo(SignInManager, 'change:signedIn', this._toggleContextButtons);
        },

        onRender: function () {
            this.ui.childContainer.sortable(this._getSortableOptions());

            this._toggleContextButtons();
            this._setDeleteButtonState();
        },
        
        onShow: function () {
            //  Store original values in data attribute to be able to revert without magic numbers.
            this.$el.data('background', this.$el.css('background')).transition({
                'background': 'rgba(0, 0, 0, 0.5)'
            }, 'snap');

            this.ui.panel.transition({
                x: this.ui.panel.width()
            }, 300, 'snap');
        },
        
        //  If the user clicks the 'dark' area outside the panel -- hide the panel.
        _hideIfClickOutsidePanel: function (event) {
            if (event.target == event.currentTarget) {
                this._hide();
            }
        },
        
        _hide: function () {
            this.$el.transition({
                'background': this.$el.data('background')
            });

            this.ui.panel.transition({
                x: -20
            }, 300, this.destroy.bind(this));
        },
        
        _getSortableOptions: function () {
            var sortableOptions = {
                axis: 'y',
                placeholder: 'sortable-placeholder list-item',
                delay: 100,
                containment: 'parent',
                update: this._onSortableUpdate.bind(this)
            };

            return sortableOptions;
        },
        
        //  Whenever a playlist is moved visually -- update corresponding model with new information.
        _onSortableUpdate: function (event, ui) {
            var listItemType = ui.item.data('type');

            //  Run this code only when reorganizing playlists.
            if (listItemType === ListItemType.Playlist) {
                var playlistId = ui.item.data('id');
                var index = ui.item.index();

                var playlist = this.collection.get(playlistId);
                var originalIndex = this.collection.indexOf(playlist);

                //  When moving a playlist down - all the items shift up one which causes an off-by-one error when calling
                //  moveToIndex. Account for this by adding 1 to the index when moving down, but not when moving up since no shift happens.
                if (originalIndex < index) {
                    index += 1;
                }

                this.collection.moveToIndex(playlistId, index);
            }
        },
        
        _showCreatePlaylistPrompt: function () {
            Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', CreatePlaylistPromptView);
        },
        
        _showEditActivePlaylistPrompt: function () {
            Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', EditPlaylistPromptView, {
                playlist: this.collection.getActivePlaylist()
            });
        },
        
        _toggleContextButtons: function () {
            this.ui.contextButtons.toggle(SignInManager.get('signedIn'));
        },
        
        _setDeleteButtonState: function () {
            //  Can't delete the last playlist:
            var canDelete = this.collection.canDelete();

            var title;
            if (canDelete) {
                title = chrome.i18n.getMessage('deletePlaylist');
            } else {
                title = chrome.i18n.getMessage('cantDeleteLastPlaylist');
            }

            this.ui.deleteButton.toggleClass('disabled', !canDelete).attr('title', title);
        },
        
        _showDeleteActivePlaylistPrompt: function () {
            var activePlaylist = this.collection.getActivePlaylist();
            var isEmpty = activePlaylist.get('items').length === 0;

            //  No need to notify if the playlist is empty.
            if (isEmpty) {
                activePlaylist.destroy();
            } else {
                Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', DeletePlaylistPromptView, {
                    playlist: activePlaylist
                });
            }
        },
        
        //  Whenever a child is double-clicked it will become active and the menu should hide itself.
        _onDblClickChildContainer: function () {
            this._hide();
        }
    });

    return PlaylistsAreaView;
});