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
        minRenderIndex: 0,
        maxRenderIndex: 0,
        
        //  The height of a rendered itemView in px. Including padding/margin.
        itemViewHeight: 40,
        viewportHeight: -1,
        
        addItemView: function (item, ItemView, index, indexOverride) {
            //  indexOverride is necessary because the 'actual' index of an item is different from its rendered position's index.
            var shouldAdd;
            if (_.isUndefined(indexOverride)) {
                shouldAdd = index >= this.minRenderIndex && index < this.maxRenderIndex;
            } else {
                shouldAdd = indexOverride >= this.minRenderIndex && indexOverride < this.maxRenderIndex;
            }

            if (shouldAdd) {
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
        
        _getMinRenderIndex: function(scrollTop) {
            var minRenderIndex = Math.floor(scrollTop / this.itemViewHeight);
            return minRenderIndex;
        },
        
        _getMaxRenderIndex: function (scrollTop) {
            var maxRenderIndex = Math.ceil((scrollTop / this.itemViewHeight) + (this.viewportHeight / this.itemViewHeight));
            return maxRenderIndex;
        },
        
        onFullyVisible: function () {
            this.isFullyVisible = true;
            
            var self = this;
            var lastScrollTop = 0;

            //  Throttle the scroll event because scrolls can happen a lot and don't need to re-calculate very often.
            this.ui.list.scroll(_.throttle(function () {
                console.log("Scrolling");
                var scrollTop = this.scrollTop;

                //  Figure out the range of items currently rendered:
                var oldMinRenderIndex = self._getMinRenderIndex(lastScrollTop);
                var oldMaxRenderIndex = self._getMaxRenderIndex(lastScrollTop);

                //  Figure out the range of items which need to be rendered:
                var minRenderIndex = self._getMinRenderIndex(scrollTop);
                var maxRenderIndex = self._getMaxRenderIndex(scrollTop);

                var itemsToAdd = [];
                var itemsToRemove = [];
                
                //  Append items in the direction being scrolled and remove items being scrolled away from.
                var direction = scrollTop > lastScrollTop ? 'down' : 'up';
                
                if (direction === 'down') {
                    //  Need to remove items which are less than the new minRenderIndex
                    if (minRenderIndex > oldMinRenderIndex) {
                        itemsToRemove = self.collection.slice(oldMinRenderIndex, minRenderIndex);
                    }
                    
                    //  Need to add items which are greater than oldMaxRenderIndex and ltoe maxRenderIndex
                    if (maxRenderIndex > oldMaxRenderIndex) {
                        itemsToAdd = self.collection.slice(oldMaxRenderIndex, maxRenderIndex);
                    }
                } else {
                    //  Need to add items which are greater than oldMinRenderIndex and ltoe minRenderIndex
                    if (minRenderIndex < oldMinRenderIndex) {
                        itemsToAdd = self.collection.slice(minRenderIndex, oldMinRenderIndex);
                    }
                    
                    //  Need to remove items which are greater than the new maxRenderIndex
                    if (maxRenderIndex < oldMaxRenderIndex) {
                        itemsToRemove = self.collection.slice(maxRenderIndex, oldMaxRenderIndex);
                    }
                }

                if (itemsToAdd.length > 0 || itemsToRemove.length > 0) {
                    self.minRenderIndex = minRenderIndex;
                    self.maxRenderIndex = maxRenderIndex;
                    
                    if (direction === 'down') {
                        //  Items will be appended from oldMaxRenderIndex forward. 
                        self._addItems(itemsToAdd, oldMaxRenderIndex, true);
                    } else {
                        self._addItems(itemsToAdd, minRenderIndex, false);
                    }
                    
                    self._removeItems(itemsToRemove);

                    self._setPaddingTop();
                    self._setHeight();
                }

                lastScrollTop = scrollTop;
            }, 20));
        },
        
        onAfterItemAdded: function (view) {
            if (this.isFullyVisible) {
                view.setTitleTooltip(view.ui.title);
            }
        },

        initialize: function () {
            //  Allow N items to be rendered initially where N is how many items need to cover the viewport.
            this.minRenderIndex = this._getMinRenderIndex(0);
            this.maxRenderIndex = this._getMaxRenderIndex(0);
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
                //  TODO: Change fires a lot and I only want to run this once -- reconsider!
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

                        console.log("Dragged search reuslts lnegth:", draggedSearchResults.length);

                        var searchResultSongs = _.map(draggedSearchResults, function (searchResult) {
                            return searchResult.get('song');
                        });

                        self.collection.addSongs(searchResultSongs, { index: ui.item.index() });
                    }
                    
                    //  Swap copy helper out with the actual item once successfully dropped because Marionette keeps track of specific view instances.
                    //  Don't swap it out until done using its dropped-position index.
                    ui.sender[0].copyHelper.replaceWith(ui.item);

                    ui.sender.data('copied', true);
                },

                over: function (event, ui) {
                    //  Override jQuery UI's sortableItem to allow a dragged item to scroll another sortable collection.
                    // http://stackoverflow.com/questions/11025470/jquery-ui-sortable-scrolling-jsfiddle-example
                    var placeholderParent = ui.placeholder.parent().parent();

                    ui.item.data('sortableItem').scrollParent = placeholderParent;
                    ui.item.data('sortableItem').overflowOffset = placeholderParent.offset();
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
        
        //  Adjust padding-top to properly position relative items inside of list since not all items are rendered.
        _setPaddingTop: function() {
            this.ui.itemContainer.css('padding-top', this.minRenderIndex * this.itemViewHeight);
        },
        
        //  Set the elements height calculated from the number of potential items rendered into it.
        //  Necessary because items are lazy-appended for performance, but scrollbar size changing not desired.
        _setHeight: function () {
            //  Subtracting minRenderIndex is important because of how CSS renders the element. If you don't subtract minRenderIndex
            //  then the rendered items will push up the height of the element by minRenderIndex * itemViewHeight.
            var height = (this.collection.length - this.minRenderIndex) * this.itemViewHeight;

            //  Keep height set to at least the viewport height to allow for proper drag-and-drop target.
            if (height < this.viewportHeight) {
                height = this.viewportHeight - height;
            }
            
            this.ui.itemContainer.height(height);
        },
        
        _addItems: function (models, indexOffset, isAddingToEnd) {
            //  Leverage Marionette's style of rendering for performance.
            this.initRenderBuffer();
            this.startBuffering();

            var ItemView;
            _.each(models, function (model, index) {
                ItemView = this.getItemView(model);
                
                if (isAddingToEnd) {
                    //  Adjust the itemView's index to account for where it is actually being added in the list
                    this.addItemView(model, ItemView, index + indexOffset);
                } else {
                    //  Adjust the itemView's index to account for where it is actually being added in the list, but
                    //  also provide the unmodified index because this is the location in the rendered itemViewList in which it will be added.
                    this.addItemView(model, ItemView, index, index + indexOffset);
                }
            }, this);

            this.endBuffering();
        },

        _removeItems: function (models) {
            _.each(models, function (model) {
                var childView = this.children.findByModel(model);

                this.removeChildView(childView);
            }, this);
        }
    });

    return MultiSelectCompositeView;
});