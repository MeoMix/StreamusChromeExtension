define([
    'common/enum/listItemType',
    'foreground/view/createPlaylistView',
    'foreground/view/behavior/tooltip',
    'foreground/view/leftCoveringPane/playlistView',
    'foreground/view/prompt/createPlaylistPromptView',
    'foreground/view/prompt/deletePlaylistPromptView',
    'foreground/view/prompt/editPlaylistPromptView',
    'foreground/view/prompt/settingsPromptView',
    'text!template/playlistsArea.html'
], function (ListItemType, CreatePlaylistView, Tooltip, PlaylistView, CreatePlaylistPromptView, DeletePlaylistPromptView, EditPlaylistPromptView, SettingsPromptView, PlaylistsAreaTemplate) {
    'use strict';

    var SignInManager = chrome.extension.getBackgroundPage().SignInManager;

    var PlaylistsAreaView = Backbone.Marionette.CompositeView.extend({
        id: 'playlists-area',
        template: _.template(PlaylistsAreaTemplate),
        childView: PlaylistView,
        childViewContainer: '@ui.childContainer',
        
        //  Overwrite resortView to only render children as expected
        resortView: function () {
            this._renderChildren();
        },

        events: {
            'click': 'hideIfClickOutsidePanel',
            'click @ui.hideButton': 'hide',
            'click @ui.settingsButton': 'showSettingsPrompt',
            'click @ui.addButton': 'showCreatePlaylistPrompt',
            'click @ui.editButton': 'showEditActivePlaylistPrompt',
            'click @ui.deleteButton:not(.disabled)': 'showDeleteActivePlaylistPrompt'
        },
        
        collectionEvents: {
            'add remove reset': 'setDeleteButtonState'
        },
        
        ui: {
            buttons: '.button-icon',
            panel: '.panel',
            childContainer: '#playlists',
            contextButtons: '.context-buttons',
            deleteButton: '#delete-playlist-button',
            addButton: '.add',
            hideButton: '.hide',
            editButton: '.edit',
            settingsButton: '#settings-button',
            textTooltipable: '.text-tooltipable'
        },
        
        templateHelpers: {
            closeMenu: chrome.i18n.getMessage('closeMenu'),
            settings: chrome.i18n.getMessage('settings'),
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
            this.listenTo(SignInManager, 'change:signedIn', this.toggleContextButtons);
        },

        onRender: function () {
            this.ui.childContainer.sortable(this._getSortableOptions());

            this.toggleContextButtons();
            this.setDeleteButtonState();
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
        _onSortableUpdate: function(event, ui) {
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
        hideIfClickOutsidePanel: function(event) {
            if (event.target == event.currentTarget) {
                this.hide();
            }
        },
        
        hide: function () {
            this.$el.transition({
                'background': this.$el.data('background')
            });

            this.ui.panel.transition({
                x: -20
            }, 300, this.destroy.bind(this));
        },
        
        showSettingsPrompt: function () {
            Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', SettingsPromptView);
        },
        
        showCreatePlaylistPrompt: function () {
            Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', CreatePlaylistPromptView);
        },
        
        showEditActivePlaylistPrompt: function () {
            Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', EditPlaylistPromptView, {
                playlist: this.collection.getActivePlaylist()
            });
        },
        
        toggleContextButtons: function () {
            this.ui.contextButtons.toggle(SignInManager.get('signedIn'));
        },
        
        setDeleteButtonState: function() {
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
        
        showDeleteActivePlaylistPrompt: function () {
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
        }
    });

    return PlaylistsAreaView;
});