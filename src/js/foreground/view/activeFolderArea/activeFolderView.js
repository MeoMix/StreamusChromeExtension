//  This is the list of playlists on the playlists tab.
define([
    'foreground/view/genericForegroundView',
    'foreground/collection/contextMenuGroups',
    'common/model/utility',
    'foreground/collection/streamItems',
    'foreground/view/activeFolderArea/playlistView',
    'foreground/view/genericPromptView',
    'foreground/view/createPlaylistView'
], function (GenericForegroundView, ContextMenuGroups, Utility, StreamItems, PlaylistView, GenericPromptView, CreatePlaylistView) {
    'use strict';

    var ActiveFolderView = GenericForegroundView.extend({
        
        tagName: 'ul',

        events: {
            'contextmenu': 'showContextMenu'
        },
        
        attributes: {
            'id': 'activeFolder'
        },
        
        //  Refreshes the playlist display with the current playlist information.
        render: function () {

            var playlists = this.model.get('playlists');

            if (playlists.length > 0) {

                //  Build up the ul of li's representing each playlist.
                var listItems = playlists.map(function (playlist) {
                    var playlistView = new PlaylistView({
                        model: playlist
                    });

                    return playlistView.render().el;
                });

                //  Do this all in one DOM insertion to prevent lag in large folders.
                this.$el.append(listItems);
            }
            
            //  TODO: Makes playlists scroll when you drag 'em around.
            var self = this;
            //  Allows for drag-and-drop of videos
            this.$el.sortable({
                axis: 'y',
                //  Adding this helps prevent unwanted clicks to play
                delay: 100,
                appendTo: 'body',
                containment: 'body',
                placeholder: "sortable-placeholder listItem",
                scroll: false,
                tolerance: 'pointer',
                helper: 'clone',
                //  Whenever a video row is moved inform the Player of the new video list order
                update: function (event, ui) {
                    
                    var playlistId = ui.item.data('playlistid');

                    //  Run this code only when reorganizing playlists.
                    if (this === ui.item.parent()[0] && playlistId) {
                        //  It's important to do this to make sure I don't count my helper elements in index.
                        var index = parseInt(ui.item.parent().children('.playlist').index(ui.item));

                        var playlist = self.model.get('playlists').get(playlistId);
                        var originalindex = self.model.get('playlists').indexOf(playlist);

                        //  When moving an item down the list -- all the items shift up one which causes an off-by-one error when calling
                        //  moveToIndex. Account for this by adding 1 to the index when moving down, but not when moving up since
                        //  no shift happens.
                        if (originalindex < index) {
                            index += 1;
                        }

                        self.model.get('playlists').moveToIndex(playlistId, index);
                    }
                    
                }
            });

            return this;
        },
        
        initialize: function () {
            this.listenTo(this.model.get('playlists'), 'add', this.addItem);
        },

        addItem: function (playlist) {

            var playlistView = new PlaylistView({
                model: playlist
            });

            var element = playlistView.render().$el;

            if (this.$el.find('.playlist').length > 0) {

                var playlists = this.model.get('playlists');
                var currentPlaylistIndex = playlists.indexOf(playlist);

                var previousPlaylistId = playlists.at(currentPlaylistIndex - 1).get('id');
                var previousPlaylistElement = this.$el.find('.playlist[data-playlistid="' + previousPlaylistId + '"]');
                
                element.insertAfter(previousPlaylistElement);

            } else {
                element.appendTo(this.$el);
            }
        },
        
        showContextMenu: function(event) {

            //  Whenever a context menu is shown -- set preventDefault to true to let foreground know to not reset the context menu.
            event.preventDefault();

            if (event.target === event.currentTarget) {
                //  Didn't bubble up from a child -- clear groups.
                ContextMenuGroups.reset();
            }

            ContextMenuGroups.add({
                items: [{
                    text: chrome.i18n.getMessage('createPlaylist'),
                    onClick: function() {

                        var createPlaylistPromptView = new GenericPromptView({
                            title: chrome.i18n.getMessage('createPlaylist'),
                            okButtonText: chrome.i18n.getMessage('create'),
                            model: new CreatePlaylistView()
                        });
                        
                        createPlaylistPromptView.fadeInAndShow();

                    }
                }]
            });
            
        },
        
        getIsOverflowing: function () {
            
            //  Only rely on currentHeight if the view is expanded, otherwise rely on oldheight.
            var currentHeight = this.$el.height();

            if (currentHeight === 0) {
                currentHeight = this.$el.data('oldheight');
            }

            var isOverflowing = false;
            var playlistCount = this.model.get('playlists').length;

            if (playlistCount > 0) {
                var playlistHeight = this.$el.find('li').height();
                var maxPlaylistsWithoutOverflow = currentHeight / playlistHeight;

                isOverflowing = playlistCount > maxPlaylistsWithoutOverflow;
            }

            return isOverflowing;
        },
        
        collapse: function() {
            
            var isOverflowing = this.getIsOverflowing();
            
            //  If the view isn't overflowing -- add overflow-y hidden so that as it collapses/expands it maintains its overflow state.
            if (!isOverflowing) {
                this.$el.css('overflow-y', 'hidden');
            }

            //  Need to set height here because transition doesn't work if height is auto through CSS.
            var currentHeight = this.$el.height();
            var heightStyle = $.trim(this.$el[0].style.height);
            if (heightStyle === '' || heightStyle === 'auto') {
                this.$el.height(currentHeight);
            }

            this.$el.data('oldheight', currentHeight);

            this.$el.transitionStop().transition({
                height: 0
            }, 200, function() {
                this.$el.hide();
                
                if (!isOverflowing) {
                    this.$el.css('overflow-y', 'auto');
                }
            }.bind(this));
        },
        
        expand: function (onComplete) {
            
            var isOverflowing = this.getIsOverflowing();

            //  If the view isn't overflowing -- add overflow-y hidden so that as it collapses/expands it maintains its overflow state.
            if (!isOverflowing) {
                this.$el.css('overflow-y', 'hidden');
            }

            this.$el.show().transitionStop().transition({
                height: this.$el.data('oldheight')
            }, 200, function() {
                if (!isOverflowing) {
                    this.$el.css('overflow-y', 'auto');
                }
                onComplete();
            }.bind(this));
        }

    });

    return ActiveFolderView;
});