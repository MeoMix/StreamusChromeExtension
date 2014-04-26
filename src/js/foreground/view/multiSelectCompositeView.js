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
        
        collectionEvents: {
            'add remove reset': '_setHeight'
        },
        
        ui: {
            list: '.list'
        },

        isFullyVisible: false,
        
        //  Enables progressive rendering of children by keeping track of indices which are currently rendered.
        minRenderedIndex: 0,
        maxRenderedIndex: 0,
        
        //  The height of a rendered itemView in px. Including padding/margin.
        itemViewHeight: 40,
        surroundingPages: 5,
        pageSize: 2,
        
        addItemView: function (item, ItemView, index) {
            if (index >= this.minRenderedIndex && index < this.maxRenderedIndex) {
                Backbone.Marionette.CompositeView.prototype.addItemView.apply(this, arguments);
            }
        },
        
        appendHtml: function(collectionView, itemView, index){
            var childrenContainer = collectionView.itemViewContainer ? collectionView.$(collectionView.itemViewContainer) : collectionView.$el;
            var children = childrenContainer.children();
            if (children.size() <= index) {
                childrenContainer.append(itemView.el);
            } else {
                children.eq(index).before(itemView.el);
            }
        },
        
        onFullyVisible: function () {
            this.isFullyVisible = true;
            
            var self = this;
            var lastScrollTop = 0;

            //  Throttle the scroll event because scrolls can happen a lot and don't need to re-calculate very often.
            this.ui.list.scroll(_.throttle(function () {
                var scrollTop = this.scrollTop;

                var currentMaxRenderedIndex = self.maxRenderedIndex;
                var currentMinRenderedIndex = self.minRenderedIndex;
                var nextItems;
                var previousItems;

                var direction = scrollTop > lastScrollTop ? 'down' : 'up';
                var scrollAllowance = self._getScrollAllowance(direction);

                console.log("scroll top/allowance:", scrollTop, scrollAllowance);
                console.log("scrolled amount/maxRendered:", scrollTop - scrollAllowance, currentMaxRenderedIndex);

                var updateDimensions = false;

                //  When the user scrolls down, append new items to the end of the list and remove from the start.
                if (direction === 'down') {

                    //  Whenever a scroll amount is exceeded -- need to append next page and potentially clean-up previous page.
                    if (scrollTop >= scrollAllowance) {
                        //  Grab the next page of information.
                        nextItems = self.collection.slice(currentMaxRenderedIndex, currentMaxRenderedIndex + self.pageSize);

                        if (nextItems.length > 0) {
                            self.maxRenderedIndex += nextItems.length;
                            self._addItemViewList(nextItems, currentMaxRenderedIndex);

                            updateDimensions = true;
                        }
                        
                        //  Don't run previous item cleanup on the initial append because haven't scrolled past the visible items just yet.
                        if (scrollTop >= (nextItems.length * self.itemViewHeight)) {
                            //  Cleanup N items where N is the amount of items being added to the front.
                            previousItems = self.collection.slice(currentMinRenderedIndex, currentMinRenderedIndex + nextItems.length);

                            if (previousItems.length > 0) {
                                self.minRenderedIndex += previousItems.length;
                                self._removeItems(previousItems);
                            }
                        }

                    }
                } else {

                    if (scrollTop <= scrollAllowance) {
                        //  Grab the next page of information.
                        nextItems = self.collection.slice(currentMinRenderedIndex - self.pageSize, currentMinRenderedIndex);

                        if (nextItems.length > 0) {
                            self.minRenderedIndex -= nextItems.length;
                            self._addItemViewList(nextItems, self.minRenderedIndex);

                            updateDimensions = true;
                        }

                        //  Cleanup N items where N is the amounts of items being added to the back.
                        previousItems = self.collection.slice(currentMaxRenderedIndex - nextItems.length, currentMaxRenderedIndex);

                        if (previousItems.length > 0) {
                            self.maxRenderedIndex -= previousItems.length;
                            self._removeItems(previousItems);
                        }
                    }
                }
                
                if (updateDimensions) {
                    //  Adjust padding and height to properly position relative items inside of list since not all items are rendered.
                    self.ui.itemContainer.css('padding-top', self.minRenderedIndex * self.itemViewHeight);
                    self._setHeight();
                }

                lastScrollTop = scrollTop;
            }, 50));
        },
        
        onAfterItemAdded: function (view) {
            if (this.isFullyVisible) {
                view.setTitleTooltip(view.ui.title);
            }
        },

        initialize: function () {
            this._setMaxRenderedIndex();
        },

        onRender: function () {
            var self = this;

            this._setHeight();
            
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
                        model: self.collection.get(listItem.data('id'))
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

                    //  Using parent's parent here works -- but I have bad feels about it since parent's parent isn't a sortable element.
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
        },
        
        //  Set the elements height calculated from the number of potential items rendered into it.
        //  Necessary because items are lazy-appended for performance, but scrollbar size changing not desired.
        _setHeight: function () {
            //  Subtracting minRenderedIndex is important because of how CSS renders the element. If you don't subtract minRenderedIndex
            //  then the rendered items will push up the height of the element by minRenderedIndex * itemViewHeight.
            var height = (this.collection.length - this.minRenderedIndex) * this.itemViewHeight;
            this.ui.itemContainer.height(height);
        },

        _setMaxRenderedIndex: function () {
            //  Figure out how many pages of items could potentially have been rendered.
            var maxRenderedIndex = this.pageSize * (1 + this.surroundingPages);

            this.maxRenderedIndex = maxRenderedIndex;
        },

        
        _addItemViewList: function (itemViewList, indexOffset) {
            //  Leverage Marionette's style of rendering for performance.
            this.initRenderBuffer();
            this.startBuffering();

            var ItemView;
            _.each(itemViewList, function (item, index) {
                ItemView = this.getItemView(item);

                //  Adjust the items index to account for where it is actually being added in the list
                this.addItemView(item, ItemView, index + indexOffset);
            }, this);

            this.endBuffering();
        },

        _removeItems: function (itemViewList) {
            _.each(itemViewList, function (child) {
                var childView = this.children.findByModel(child);

                this.removeChildView(childView);
            }, this);
        },
        
        _getScrollAllowance: function (direction) {
            var scrollAllowance = 0;

            switch (direction) {
                case 'down':
                    scrollAllowance = this.maxRenderedIndex * this.itemViewHeight - this._getInitialScrollAllowance();
                    console.log("max rendered and initial:", this.maxRenderedIndex, this._getInitialScrollAllowance());
                    break;
                case 'up':
                    scrollAllowance = this.minRenderedIndex * this.itemViewHeight;
                    break;
                default:
                    console.error('unhandled direction', direction);
            }

            return scrollAllowance;
        },

        //  By default, load 2 pages of items, but start appending new pages of items when you're half way through the initial pages.
        _getInitialScrollAllowance: function () {
            //var scrollAllowance = this.pageSize * (1 + this.surroundingPages) * (this.itemViewHeight / 2);
            var scrollAllowance = this.pageSize * (1 + this.surroundingPages) * (this.itemViewHeight);
            return scrollAllowance;
        }
    });

    return MultiSelectCompositeView;
});