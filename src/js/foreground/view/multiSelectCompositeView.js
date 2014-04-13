define([
    'common/enum/listItemType',
    'foreground/view/leftBasePane/playlistItemView',
    'foreground/view/leftCoveringPane/SearchResultView',
    'foreground/view/rightBasePane/streamItemView'
], function (ListItemType, PlaylistItemView, SearchResultView, StreamItemView) {
    'use strict';

    var Playlists = chrome.extension.getBackgroundPage().Playlists;
    var SearchResults = chrome.extension.getBackgroundPage().SearchResults;
    var StreamItems = chrome.extension.getBackgroundPage().StreamItems;
    var User = chrome.extension.getBackgroundPage().User;

    var MultiSelectCompositeView = Backbone.Marionette.CompositeView.extend({

        events: {
            'click .list-item': 'setSelectedOnClick'
        },

        isFullyVisible: false,
        
        //  Tell images that they're able to bind lazyLoading functionality only once fully visible because when they're sliding in you're unable to tell if they're visible in one direction.
        //  But, I guess you know that direction is going to be loaded, so maybe it's fine to only check one direction?
        onFullyVisible: function () {
            if (_.isUndefined(this.ui.itemContainer))
                throw "itemContainer is undefined";

            $(this.children.map(function (child) {
                return child.ui.imageThumbnail.toArray();
            })).lazyload({
                container: this.ui.itemContainer,
                threshold: 250
            });

            this.isFullyVisible = true;
        },
        
        onAfterItemAdded: function (view) {
            if (this.isFullyVisible) {
                view.ui.imageThumbnail.lazyload({
                    container: this.ui.itemContainer,
                    threshold: 250
                });

                view.setTitleTooltip(view.ui.title);
            }
        },

        onRender: function () {
            var self = this;

            this.ui.itemContainer.sortable({

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
                        model: self.collection.get(listItem.data('id')),
                        //  Don't lazy-load the view because copy helper is clearly visible
                        instant: true
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
                    $('.hidden-until-change').removeClass('hidden-until-change');
                },
                start: function (event, ui) {

                    var listItemType = ui.item.data('type');
                    
                    //  TODO: This logic prevents dragging a duplicate streamItem to a Playlist, but I also would like to prevent
                    //  duplicates in the Stream.
                    if (listItemType === ListItemType.StreamItem) {
                        if (User.get('signedIn')) {
                            var streamItemId = ui.item.data('id');

                            //  Color the placeholder to indicate that the StreamItem can't be copied into the Playlist.
                            var draggedStreamItem = self.collection.get(streamItemId);

                            var alreadyExists = Playlists.getActivePlaylist().get('items').hasSong(draggedStreamItem.get('song'));
                            ui.placeholder.toggleClass('no-drop', alreadyExists);
                        } else {
                            ui.placeholder.addClass('not-signed-in');
                        }
                    }

                    var modelToSelect = self.collection.get(ui.item.data('id'));
                    self.doSetSelected({
                        modelToSelect: modelToSelect,
                        drag: true
                    });

                    this.selectedItems = self.$el.find('.selected');

                    this.selectedItems.css({
                        opacity: '.5'
                    });

                    //  Set it here not in helper because dragStart may select a search result.
                    ui.helper.text(self.collection.selected().length);

                    //  Override sortableItem here to ensure that dragging still works inside the normal parent collection.
                    //  http://stackoverflow.com/questions/11025470/jquery-ui-sortable-scrolling-jsfiddle-example
                    ui.item.data('sortableItem').scrollParent = ui.placeholder.parent();
                    ui.item.data('sortableItem').overflowOffset = ui.placeholder.parent().offset();
                },

                stop: function (event, ui) {

                    this.backCopyHelper.removeClass('copy-helper');

                    var copied = $(this).data('copied');
                    if (copied) {
                        this.copyHelper.removeClass('copy-helper');
                    }
                    else {
                        this.copyHelper.remove();
                        
                        //  Whenever a PlaylistItem or StreamItem row is reorganized -- update.
                        var listItemType = ui.item.data('type');
                        if (listItemType === ListItemType.PlaylistItem || listItemType === ListItemType.StreamItem) {
                            self.collection.moveToIndex(ui.item.data('id'), ui.item.index());
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

                    //  Swap copy helper out with the actual item once successfully dropped because Marionette keeps track of specific view instances.
                    ui.sender[0].copyHelper.replaceWith(ui.item);

                    var listItemType = ui.item.data('type');
                    
                    //  TODO: Can these three options be made more DRY?
                    if (listItemType === ListItemType.StreamItem) {
                        var draggedStreamItems = StreamItems.selected();
                        StreamItems.deselectAll();

                        var streamItemSongs = _.map(draggedStreamItems, function(streamItem) {
                            return streamItem.get('song');
                        });

                        self.model.addSongsStartingAtIndex(streamItemSongs, ui.item.index());
                    }
                    else if (listItemType === ListItemType.PlaylistItem) {
                        var activePlaylistItems = Playlists.getActivePlaylist().get('items');
                        var draggedPlaylistItems = activePlaylistItems.selected();
                        activePlaylistItems.deselectAll();
                        
                        var playlistItemSongs = _.map(draggedPlaylistItems, function (playlistItem) {
                            return playlistItem.get('song');
                        });

                        self.collection.addSongs(playlistItemSongs, { index: ui.item.index() });
                    } else if (listItemType === ListItemType.SearchResult) {
                        var draggedSearchResults = SearchResults.selected();
                        SearchResults.deselectAll();

                        var searchResultSongs = _.map(draggedSearchResults, function (searchResult) {
                            return searchResult.get('song');
                        });

                        self.collection.addSongs(searchResultSongs, { index: ui.item.index() });
                    }

                    ui.sender.data('copied', true);
                },

                over: function (event, ui) {
                    //  Override jQuery UI's sortableItem to allow a dragged item to scroll another sortable collection.
                    // http://stackoverflow.com/questions/11025470/jquery-ui-sortable-scrolling-jsfiddle-example
                    ui.item.data('sortableItem').scrollParent = ui.placeholder.parent();
                    ui.item.data('sortableItem').overflowOffset = ui.placeholder.parent().offset();
                }
            });

            return this;
        },

        setSelectedOnClick: function (event) {

            var id = $(event.currentTarget).data('id');
            var modelToSelect = this.collection.get(id);

            this.doSetSelected({
                shiftKey: event.shiftKey,
                ctrlKey: event.ctrlKey,
                modelToSelect: modelToSelect
            });

        },

        doSetSelected: function (options) {
            var modelToSelect = options.modelToSelect;

            var shiftKeyPressed = options.shiftKey || false;
            var ctrlKeyPressed = options.ctrlKey || false;
            var isDrag = options.drag || false;

            var isSelectedAlready = modelToSelect.get('selected');
            modelToSelect.set('selected', (ctrlKeyPressed && isSelectedAlready) ? false : true);

            //  When the shift key is pressed - select a block of search result items
            if (shiftKeyPressed) {

                var firstSelectedIndex = 0;
                var selectedIndex = this.collection.indexOf(modelToSelect);

                //  If the first item is being selected with shift held -- firstSelectedIndex isn't used and selection goes from the top.
                if (this.collection.selected().length > 1) {
                    var firstSelected = this.collection.firstSelected();

                    //  Get the search result which was selected first and go from its index.
                    firstSelectedIndex = this.collection.indexOf(firstSelected);
                }

                //  Select all items between the selected item and the firstSelected item.
                this.collection.each(function (model, index) {
                    var isBetweenAbove = index <= selectedIndex && index >= firstSelectedIndex;
                    var isBetweenBelow = index >= selectedIndex && index <= firstSelectedIndex;

                    model.set('selected', isBetweenBelow || isBetweenAbove);
                });
                
                //  Holding the shift key is a bit of a special case. User expects the first item highlighted to be the 'firstSelected' and not the clicked.
                this.collection.at(firstSelectedIndex).set('firstSelected', true);
                
            } else if (ctrlKeyPressed) {
                //  Using the ctrl key to select an item resets firstSelect (which is a special scenario)
                //  but doesn't lose the other selected items.
                modelToSelect.set('firstSelected', true);
            } else if (!(isDrag && isSelectedAlready)) {
                //  All other selections are lost unless dragging a group of items.
                this.collection.deselectAllExcept(modelToSelect);
            }
        }
    });

    return MultiSelectCompositeView;
});