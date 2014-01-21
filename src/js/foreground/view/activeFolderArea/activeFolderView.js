//  This is the list of playlists on the playlists tab.
define([
    'foreground/view/genericForegroundView',
    'foreground/model/foregroundViewManager',
    'foreground/collection/contextMenuGroups',
    'common/model/utility',
    'foreground/collection/streamItems',
    'foreground/view/activeFolderArea/playlistView',
    'foreground/view/prompt/createPlaylistPromptView',
    'enum/listItemType'
], function (GenericForegroundView, ForegroundViewManager, ContextMenuGroups, Utility, StreamItems, PlaylistView, CreatePlaylistPromptView, ListItemType) {
    'use strict';

    //  TODO: Consider using a CompositeView vs a CollectionView.
    //  TODO: Rename this to PlaylistsCollectionView because it doesn't depend on a folder.
    var ActiveFolderView = Backbone.Marionette.CollectionView.extend({
        
        tagName: 'ul',
        id: 'activeFolder',
        itemView: PlaylistView,

        //  TODO: triggers for showContextMenu
        events: {
            'contextmenu': 'showContextMenu'
        },
        
        // TODO: This seems useful:
        //There may be scenarios where you need to pass data from your parent collection view in to each of the itemView instances. To do this, provide a itemViewOptions definition on your collection view as an object literal. This will be passed to the constructor of your itemView as part of the options.
        
        onDomRefresh: function() {
            //  TODO: Makes playlists scroll when you drag 'em around.
            var self = this;
            //  Allows for drag-and-drop of videos
            this.$el.sortable({
                axis: 'y',
                //  Adding this helps prevent unwanted clicks to play
                delay: 100,
                appendTo: 'body',
                containment: 'body',
                placeholder: 'sortable-placeholder listItem',
                scroll: false,
                tolerance: 'pointer',
                helper: 'clone',
                
                //  Whenever a playlist is moved visually -- update corresponding model with new information.
                update: function (event, ui) {
                    var listItemType = ui.item.data('type');

                    //  Run this code only when reorganizing playlists.
                    if (listItemType === ListItemType.Playlist) {

                        var playlistId = ui.item.data('id');

                        //  TODO: I don't believe this anymore, double check.
                        //  It's important to do this to make sure I don't count my helper elements in index.
                        var index = parseInt(ui.item.parent().children('.playlist').index(ui.item));

                        var playlist = self.collection.get(playlistId);
                        var originalindex = self.collection.indexOf(playlist);

                        //  TODO: I don't believe this, either!
                        //  When moving an item down the list -- all the items shift up one which causes an off-by-one error when calling
                        //  moveToIndex. Account for this by adding 1 to the index when moving down, but not when moving up since
                        //  no shift happens.
                        if (originalindex < index) {
                            index += 1;
                        }

                        self.collection.moveToIndex(playlistId, index);
                    }

                }
            });
        },
        
        initialize: function () {
            //  TODO: This might not be necessary with Marionette.
            //this.listenTo(this.model.get('playlists'), 'add', this.addItem);
            
            //  TODO: Don't do memory management like this -- use regions, I think!
            ForegroundViewManager.get('views').push(this);
        },

        //  TODO: Hopefully not needed anymore.
        //addItem: function (playlist) {

        //    var playlistView = new PlaylistView({
        //        model: playlist
        //    });

        //    var element = playlistView.render().$el;

        //    if (this.$el.find('.playlist').length > 0) {

        //        var playlists = this.model.get('playlists');
        //        var currentPlaylistIndex = playlists.indexOf(playlist);

        //        var previousPlaylistId = playlists.at(currentPlaylistIndex - 1).get('id');
        //        var previousPlaylistElement = this.$el.find('.playlist[data-id="' + previousPlaylistId + '"]');
                
        //        element.insertAfter(previousPlaylistElement);

        //    } else {
        //        element.appendTo(this.$el);
        //    }
        //},
        
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
                        var createPlaylistPromptView = new CreatePlaylistPromptView();
                        createPlaylistPromptView.fadeInAndShow();
                    }
                }]
            });
            
        },
        
        //  TODO: I still think it's possible to improve the clarity of this with better CSS/HTML mark-up.
        getIsOverflowing: function () {
            
            //  Only rely on currentHeight if the view is expanded, otherwise rely on oldheight.
            var currentHeight = this.$el.height();

            if (currentHeight === 0) {
                currentHeight = this.$el.data('oldheight');
            }

            var isOverflowing = false;
            var playlistCount = this.collection.length;

            if (playlistCount > 0) {
                var playlistHeight = this.$el.find('li').height();
                var maxPlaylistsWithoutOverflow = currentHeight / playlistHeight;

                isOverflowing = playlistCount > maxPlaylistsWithoutOverflow;
            }

            return isOverflowing;
        },
        
        //  TODO: Maybe I can use show/hide? Maybe that's a poor idea though.
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
                height: 0,
                opacity: 0
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
                height: this.$el.data('oldheight'),
                opacity: 1
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