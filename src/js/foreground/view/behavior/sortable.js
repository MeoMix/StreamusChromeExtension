define([
    'common/enum/listItemType',
    'foreground/view/leftBasePane/playlistItemView',
    'foreground/view/leftCoveringPane/searchResultView',
    'foreground/view/rightBasePane/streamItemView'
], function (ListItemType, PlaylistItemView, SearchResultView, StreamItemView) {
    'use strict';

    var Playlists = chrome.extension.getBackgroundPage().Playlists;
    var SearchResults = chrome.extension.getBackgroundPage().SearchResults;
    var StreamItems = chrome.extension.getBackgroundPage().StreamItems;
    var User = chrome.extension.getBackgroundPage().User;

    var Sortable = Backbone.Marionette.Behavior.extend({

        onRender: function () {
            var self = this;

            this.view.ui.itemContainer.sortable({

                connectWith: '.droppable-list',

                cursorAt: {
                    right: 35,
                    bottom: 40
                },

                //  Adding a delay helps preventing unwanted drags when clicking on an element.
                delay: 100,

                placeholder: 'sortable-placeholder list-item hidden-until-change',

                helper: function (ui, listItem) {
                    //  Create a new view instead of just copying the HTML in order to preserve HTML->Backbone.View relationship
                    var copyHelperView;
                    var viewOptions = {
                        model: self.view.collection.get(listItem.data('id'))
                    };

                    var listItemType = listItem.data('type');

                    switch (listItemType) {
                        case ListItemType.PlaylistItem:
                            copyHelperView = new PlaylistItemView(viewOptions);
                            break;
                        case ListItemType.StreamItem:
                            copyHelperView = new StreamItemView(viewOptions);
                            break;
                        case ListItemType.SearchResult:
                            copyHelperView = new SearchResultView(viewOptions);
                            break;
                        default:
                            throw 'Unhandled ListItemType: ' + listItemType;
                    }

                    this.copyHelperView = copyHelperView;
                    this.copyHelper = copyHelperView.render().$el.insertAfter(listItem);
                    this.copyHelper.addClass('copy-helper');

                    this.backCopyHelper = listItem.prev();
                    this.backCopyHelper.addClass('copy-helper');

                    $(this).data('copied', false);

                    return $('<span>', {
                        'class': 'selected-models-length'
                    });
                },
                change: function () {
                    //  There's a CSS redraw issue with my CSS selector: .listItem.copyHelper + .sortable-placeholder 
                    //  So, I manually hide the placehelper (like it would be normally) until a change occurs -- then the CSS can take over.
                    if (this.needFixCssRedraw) {
                        $('.hidden-until-change').removeClass('hidden-until-change');
                        this.needFixCssRedraw = false;
                    }
                },
                start: function (event, ui) {
                    self.view.triggerMethod('ItemDragged', self.view.collection.get(ui.item.data('id')));

                    this.needFixCssRedraw = true;

                    var listItemType = ui.item.data('type');

                    //  TODO: This logic prevents dragging a duplicate streamItem to a Playlist, but I also would like to prevent
                    //  duplicates in the Stream.
                    if (listItemType === ListItemType.StreamItem) {
                        if (User.get('signedIn')) {
                            var streamItemId = ui.item.data('id');

                            //  Color the placeholder to indicate that the StreamItem can't be copied into the Playlist.
                            var draggedStreamItem = self.view.collection.get(streamItemId);

                            var alreadyExists = Playlists.getActivePlaylist().get('items').hasSong(draggedStreamItem.get('song'));
                            ui.placeholder.toggleClass('no-drop', alreadyExists);
                        } else {
                            ui.placeholder.addClass('not-signed-in');
                        }
                    }

                    this.selectedItems = self.view.$el.find('.selected');

                    this.selectedItems.css({
                        opacity: '.5'
                    });

                    //  Set it here not in helper because dragStart may select a search result.
                    ui.helper.text(self.view.collection.selected().length);

                    //  Override sortableItem here to ensure that dragging still works inside the normal parent collection.
                    //  http://stackoverflow.com/questions/11025470/jquery-ui-sortable-scrolling-jsfiddle-example
                    var placeholderParent = ui.placeholder.parent().parent();

                    ui.item.data('sortableItem').scrollParent = placeholderParent;
                    ui.item.data('sortableItem').overflowOffset = placeholderParent.offset();
                },

                stop: function (event, ui) {
                    this.backCopyHelper.removeClass('copy-helper');

                    var copied = $(this).data('copied');
                    if (copied) {
                        this.copyHelper.removeClass('copy-helper');
                    }
                    else {
                        this.copyHelperView.close();

                        //  Whenever a PlaylistItem or StreamItem row is reorganized -- update.
                        var listItemType = ui.item.data('type');
                        if (listItemType === ListItemType.PlaylistItem || listItemType === ListItemType.StreamItem) {
                            //  Index inside of receive may be incorrect if the user is scrolled down -- some items will have been unrendered.
                            //  Need to pad the index with the # of missing items.
                            self.view.listenToOnce(self.view, 'GetMinRenderIndexReponse', function (response) {
                                var index = ui.item.index() + response.minRenderIndex;

                                self.view.collection.moveToIndex(ui.item.data('id'), index);
                            });

                            self.view.triggerMethod('GetMinRenderIndex');
                        }
                    }

                    this.selectedItems.css({
                        opacity: '1'
                    });

                    this.copyHelper = null;
                    this.backCopyHelper = null;
                    this.selectedItems = null;

                    //  Don't allow SearchResults to be sorted -- copied is true when it moves to StreamItems.
                    //  Returning false cancels the sort.
                    var isSearchResult = ui.item.data('type') === ListItemType.SearchResult;

                    return copied || !isSearchResult;
                },

                tolerance: 'pointer',
                receive: function (event, ui) {
                    //  Index inside of receive may be incorrect if the user is scrolled down -- some items will have been unrendered.
                    //  Need to pad the index with the # of missing items.
                    self.view.listenToOnce(self.view, 'GetMinRenderIndexReponse', function (response) {
                        var index = ui.item.index() + response.minRenderIndex;

                        var listItemType = ui.item.data('type');

                        //  TODO: Can these three options be made more DRY?
                        if (listItemType === ListItemType.StreamItem) {
                            var draggedStreamItems = StreamItems.selected();
                            StreamItems.deselectAll();

                            var streamItemSongs = _.map(draggedStreamItems, function (streamItem) {
                                return streamItem.get('song');
                            });

                            self.view.model.addSongsStartingAtIndex(streamItemSongs, index);
                        }
                        else if (listItemType === ListItemType.PlaylistItem) {
                            var activePlaylistItems = Playlists.getActivePlaylist().get('items');
                            var draggedPlaylistItems = activePlaylistItems.selected();
                            activePlaylistItems.deselectAll();

                            var playlistItemSongs = _.map(draggedPlaylistItems, function (playlistItem) {
                                return playlistItem.get('song');
                            });

                            self.view.collection.addSongs(playlistItemSongs, { index: index });
                        } else if (listItemType === ListItemType.SearchResult) {
                            var draggedSearchResults = SearchResults.selected();
                            SearchResults.deselectAll();

                            var searchResultSongs = _.map(draggedSearchResults, function (searchResult) {
                                return searchResult.get('song');
                            });

                            self.view.collection.addSongs(searchResultSongs, { index: index });
                        }
                        
                        //  Swap copy helper out with the actual item once successfully dropped because Marionette keeps track of specific view instances.
                        //  Don't swap it out until done using its dropped-position index.
                        ui.sender[0].copyHelper.replaceWith(ui.item);
                        ui.sender[0].copyHelperView.close();

                        ui.sender.data('copied', true);

                    });

                    self.view.triggerMethod('GetMinRenderIndex');
                },

                over: function (event, ui) {
                    //  Override jQuery UI's sortableItem to allow a dragged item to scroll another sortable collection.
                    // http://stackoverflow.com/questions/11025470/jquery-ui-sortable-scrolling-jsfiddle-example
                    var placeholderParent = ui.placeholder.parent().parent();

                    ui.item.data('sortableItem').scrollParent = placeholderParent;
                    ui.item.data('sortableItem').overflowOffset = placeholderParent.offset();
                }
            });
        }

    });

    return Sortable;
});