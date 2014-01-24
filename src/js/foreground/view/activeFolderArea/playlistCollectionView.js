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

    var PlaylistCollectionView = Backbone.Marionette.CollectionView.extend({
        
        tagName: 'ul',
        id: 'activeFolder',
        itemView: PlaylistView,
       
        // TODO: This seems useful:
        //There may be scenarios where you need to pass data from your parent collection view in to each of the itemView instances. To do this, provide a itemViewOptions definition on your collection view as an object literal. This will be passed to the constructor of your itemView as part of the options.
        
        //  TODO: use onDomRefresh after a region is introduced and view is called via region.show
        onRender: function () {

            var self = this;
            this.$el.sortable({
                axis: 'y',
                placeholder: 'sortable-placeholder listItem',
                tolerance: 'pointer',
                //  Whenever a playlist is moved visually -- update corresponding model with new information.
                update: function (event, ui) {
                    var listItemType = ui.item.data('type');

                    //  Run this code only when reorganizing playlists.
                    if (listItemType === ListItemType.Playlist) {

                        var playlistId = ui.item.data('id');
                        
                        var index = ui.item.index();

                        var playlist = self.collection.get(playlistId);
                        var originalindex = self.collection.indexOf(playlist);

                        //  TODO: I don't believe this, either!
                        //  When moving an item down the list -- all the items shift up one which causes an off-by-one error when calling
                        //  moveToIndex. Account for this by adding 1 to the index when moving down, but not when moving up since
                        //  no shift happens.
                        if (originalindex < index) {
                            console.log("original index is LESS!");
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

    return PlaylistCollectionView;
});