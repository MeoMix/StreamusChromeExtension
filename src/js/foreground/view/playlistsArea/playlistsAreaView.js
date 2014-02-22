define([
    'text!template/playlistsArea.html',
    'common/view/settingsView',
    'foreground/model/genericPrompt',
    'foreground/view/prompt/genericPromptView',
    'foreground/view/prompt/createPlaylistPromptView',
    'foreground/view/createPlaylistView',
    'foreground/view/prompt/editPlaylistPromptView',
    'background/collection/playlists',
    'foreground/view/playlistsArea/playlistView',
    'common/enum/listItemType',
    'background/model/user',
    'foreground/view/prompt/deletePlaylistPromptView'
], function (PlaylistsAreaTemplate, SettingsView, GenericPrompt, GenericPromptView, CreatePlaylistPromptView, CreatePlaylistView, EditPlaylistPromptView, Playlists, PlaylistView, ListItemType, User, DeletePlaylistPromptView) {
    'use strict';

    var PlaylistsAreaView = Backbone.Marionette.CompositeView.extend({

        id: 'playlistsArea',
        template: _.template(PlaylistsAreaTemplate),
        itemView: PlaylistView,
        itemViewContainer: '#playlists',

        events: {
            'click': 'hideIfClickOutsidePanel',
            'click .hide': 'hide',
            'click h3': 'togglePlaylistsVisibility',
            'click @ui.settingsButton': 'showSettingsPrompt',
            'click .add': 'showCreatePlaylistPrompt',
            'click .edit': 'showEditSelectedPlaylistPrompt',
            'click @ui.enabledDeleteButton': 'showDeleteSelectedPlaylistPrompt'
        },
        
        ui: {
            panel: '.panel',
            playlists: 'ul#playlists',
            contextButtons: '.context-buttons',
            deleteButton: '#delete-playlist-button',
            enabledDeleteButton: '#delete-playlist-button:not(.disabled)',
            settingsButton: '#settings-button'
        },
        
        templateHelpers: {
            closeMenu: chrome.i18n.getMessage('closeMenu'),
            settings: chrome.i18n.getMessage('settings'),
            playlists: chrome.i18n.getMessage('playlists'),
            createPlaylist: chrome.i18n.getMessage('createPlaylist'),
            editPlaylist: chrome.i18n.getMessage('editPlaylist')
        },
        
        onRender: function () {

            this.ui.playlists.sortable({
                axis: 'y',
                placeholder: 'sortable-placeholder listItem',
                delay: 100,
                //  Whenever a playlist is moved visually -- update corresponding model with new information.
                update: function (event, ui) {
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

                }.bind(this)
            });

            this.toggleContextButtons();
            this.setDeleteButtonState();
            this.applyTooltips();
        },

        initialize: function () {
            //  Don't show playlist actions if User isn't signedIn because won't be able to save reliably.
            this.listenTo(User, 'change:signedIn', this.toggleContextButtons);
            this.listenTo(Playlists, 'add remove reset', this.setDeleteButtonState);
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
            }, 300, function() {
                this.model.destroy();
            }.bind(this));
            
        },

        togglePlaylistsVisibility: function(event) {

            var caretIcon = $(event.currentTarget).find('i');
            var isExpanded = caretIcon.data('expanded');

            if (isExpanded) {
                caretIcon.data('expanded', false);
            }

            caretIcon.transitionStop().transition({
                rotate: isExpanded ? -90 : 0
            }, 200);

            if (isExpanded) {
                this.collapsePlaylistCollection();
            } else {
                this.expandPlaylistCollection(function () {
                    caretIcon.data('expanded', true);
                });
            }

        },

        //  TODO: I still think it's possible to improve the clarity of this with better CSS/HTML mark-up.
        arePlaylistsOverflowing: function () {
            
            //  Only rely on currentHeight if the view is expanded, otherwise rely on oldheight.
            var currentHeight = this.ui.playlists.height();

            if (currentHeight === 0) {
                currentHeight = this.ui.playlists.data('oldheight');
            }

            var isOverflowing = false;
            var playlistCount = this.collection.length;

            if (playlistCount > 0) {
                var playlistHeight = this.ui.playlists.find('li').height();
                var maxPlaylistsWithoutOverflow = currentHeight / playlistHeight;

                isOverflowing = playlistCount > maxPlaylistsWithoutOverflow;
            }

            return isOverflowing;
        },

        collapsePlaylistCollection: function() {
            var isOverflowing = this.arePlaylistsOverflowing();

            //  If the view isn't overflowing -- add overflow-y hidden so that as it collapses/expands it maintains its overflow state.
            if (!isOverflowing) {
                this.ui.playlists.css('overflow-y', 'hidden');
            }

            //  Need to set height here because transition doesn't work if height is auto through CSS.
            var currentHeight = this.ui.playlists.height();
            var heightStyle = $.trim(this.ui.playlists[0].style.height);
            if (heightStyle === '' || heightStyle === 'auto') {
                this.ui.playlists.height(currentHeight);
            }

            this.ui.playlists.data('oldheight', currentHeight);

            this.ui.playlists.transitionStop().transition({
                height: 0,
                opacity: 0
            }, 200, function () {
                this.ui.playlists.hide();

                if (!isOverflowing) {
                    this.ui.playlists.css('overflow-y', 'auto');
                }
            }.bind(this));
        },
        
        expandPlaylistCollection: function(onComplete) {
                        
            var isOverflowing = this.arePlaylistsOverflowing();

            //  If the view isn't overflowing -- add overflow-y hidden so that as it collapses/expands it maintains its overflow state.
            if (!isOverflowing) {
                this.ui.playlists.css('overflow-y', 'hidden');
            }

            this.ui.playlists.show().transitionStop().transition({
                height: this.ui.playlists.data('oldheight'),
                opacity: 1
            }, 200, function() {
                if (!isOverflowing) {
                    this.ui.playlists.css('overflow-y', 'auto');
                }
                onComplete();
            }.bind(this));
            
        },
        
        showSettingsPrompt: function () {
            
            var settingsPromptView = new GenericPromptView({
                model: new GenericPrompt({
                    title: chrome.i18n.getMessage('settings'),
                    okButtonText: chrome.i18n.getMessage('save'),
                    view: new SettingsView()
                })
            });

            settingsPromptView.fadeInAndShow();

        },
        
        showCreatePlaylistPrompt: function () {
            var createPlaylistPromptView = new CreatePlaylistPromptView();
            createPlaylistPromptView.fadeInAndShow();
        },
        
        showEditSelectedPlaylistPrompt: function () {
            var editPlaylistPromptView = new EditPlaylistPromptView({
                playlist: Playlists.getActivePlaylist()
            });
            
            editPlaylistPromptView.fadeInAndShow();
        },
        
        toggleContextButtons: function () {
            this.ui.contextButtons.toggle(User.get('signedIn'));
        },
        
        setDeleteButtonState: function() {
            //  Can't delete the last playlist:
            var canDelete = Playlists.canDelete();

            var title;
            if (canDelete) {
                title = chrome.i18n.getMessage('deletePlaylist');
            } else {
                title = chrome.i18n.getMessage('cantDeleteLastPlaylist');
            }

            this.ui.deleteButton.toggleClass('disabled', !canDelete).attr('title', title);
        },
        
        showDeleteSelectedPlaylistPrompt: function () {

            var activePlaylist = Playlists.getActivePlaylist();
            var isEmpty = activePlaylist.get('items').length === 0;

            //  No need to notify if the playlist is empty.
            if (isEmpty) {
                activePlaylist.destroy();
            } else {
                var deletePlaylistPromptView = new DeletePlaylistPromptView({
                    playlist: activePlaylist
                });

                //  TODO: This doesn't highlight the fact that Settings controls whether it shows or not.
                deletePlaylistPromptView.fadeInAndShow();
            }

        }

    });

    return PlaylistsAreaView;
});