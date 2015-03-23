define(function(require) {
    'use strict';

    var Direction = require('common/enum/direction');

    var SlidingRender = Marionette.Behavior.extend({
        collectionEvents: {
            //  IMPORTANT: These method names are valid in Behavior but NOT in CompositeView or CollectionView; clashes with _onCollectionAdd and _onCollectionRemove in Marionette.
            'reset': '_onCollectionReset',
            'remove': '_onCollectionRemove',
            'add': '_onCollectionAdd',
            'change:active': '_onCollectionChangeActive'
        },
        
        //  Enables progressive rendering of children by keeping track of indices which are currently rendered.
        minRenderIndex: -1,
        maxRenderIndex: -1,

        //  The height of a rendered childView in px. Including padding/margin.
        childViewHeight: 56,
        viewportHeight: -1,
        
        //  The number of items to render outside of the viewport. Helps with flickering because if
        //  only views which would be visible are rendered then they'd be visible while loading.
        threshold: 10,

        //  Keep track of where user is scrolling from to determine direction and amount changed.
        lastScrollTop: 0,

        initialize: function() {
            //  IMPORTANT: Stub out the view's implementation of addChild with the slidingRender version.
            this.view.addChild = this._addChild.bind(this);
            this.view.showCollection = this._showCollection.bind(this);

            this.listenTo(Streamus.channels.window.vent, 'resize', this._onWindowResize);
        },

        onRender: function() {
            //  It's important to set minRenderIndex before onAttach because if a view triggers ListHeightUpdated during its
            //  onAttach then SlidingRender will call _setViewportHeight before minRenderIndex has been set.
            this.minRenderIndex = this._getMinRenderIndex(0);
        },

        onAttach: function() {
            //  Allow N items to be rendered initially where N is how many items need to cover the viewport.
            this._setViewportHeight();

            //  If the collection implements getActiveItem - scroll to the active item.
            if (this.view.collection.getActiveItem) {
                if (this.view.collection.length > 0) {
                    this._scrollToItem(this.view.collection.getActiveItem());
                }
            }

            var self = this;
            //  Throttle the scroll event because scrolls can happen a lot and don't need to re-calculate very often.
            this.$el.scroll(_.throttle(function() {
                self._setRenderedElements(this.scrollTop);
            }, 20));
        },
        
        //  jQuery UI's sortable needs to be able to know the minimum rendered index. Whenever an external
        //  event requests the min render index -- return it!
        onGetMinRenderIndex: function() {
            this.view.triggerMethod('GetMinRenderIndexResponse', {
                minRenderIndex: this.minRenderIndex
            });
        },

        onListHeightUpdated: function() {
            this._setViewportHeight();
        },

        _onWindowResize: function() {
            this._setViewportHeight();
        },
        
        //  Whenever the viewport height is changed -- adjust the items which are currently rendered to match
        _setViewportHeight: function() {
            this.viewportHeight = this.$el.height();

            //  Unload or load N items where N is the difference in viewport height.
            var currentMaxRenderIndex = this.maxRenderIndex;

            var newMaxRenderIndex = this._getMaxRenderIndex(this.lastScrollTop);
            var indexDifference = currentMaxRenderIndex - newMaxRenderIndex;

            //  Be sure to update before potentially adding items or else they won't render.
            this.maxRenderIndex = newMaxRenderIndex;
            if (indexDifference > 0) {
                //  Unload N Items.
                //  Only remove items if need be -- collection's length might be so small that the viewport's height isn't affecting rendered count.
                if (this.view.collection.length > currentMaxRenderIndex) {
                    this._removeItemsByIndex(currentMaxRenderIndex, indexDifference);
                }
            } else if (indexDifference < 0) {
                //  Load N items
                for (var count = 0; count < Math.abs(indexDifference); count++) {
                    this._renderElementAtIndex(currentMaxRenderIndex + 1 + count);
                }
            }

            this._setHeightPaddingTop();
        },

        //  When deleting an element from a list it's important to render the next element (if any) since
        //  positions change when removing.
        _renderElementAtIndex: function(index) {
            var rendered = false;

            if (this.view.collection.length > index) {
                var item = this.view.collection.at(index);
                var ChildView = this.view.getChildView(item);

                //  Adjust the childView's index to account for where it is actually being added in the list
                this._addChild(item, ChildView, index);
                rendered = true;
            }

            return rendered;
        },

        _setRenderedElements: function(scrollTop) {
            //  Figure out the range of items currently rendered:
            var currentMinRenderIndex = this.minRenderIndex;
            var currentMaxRenderIndex = this.maxRenderIndex;

            //  Figure out the range of items which need to be rendered:
            var minRenderIndex = this._getMinRenderIndex(scrollTop);
            var maxRenderIndex = this._getMaxRenderIndex(scrollTop);

            var itemsToAdd = [];
            var itemsToRemove = [];

            //  Append items in the direction being scrolled and remove items being scrolled away from.
            var direction = scrollTop > this.lastScrollTop ? Direction.Down : Direction.Up;

            if (direction === Direction.Down) {
                //  Need to remove items which are less than the new minRenderIndex
                if (minRenderIndex > currentMinRenderIndex) {
                    itemsToRemove = this.view.collection.slice(currentMinRenderIndex, minRenderIndex);
                }

                //  Need to add items which are greater than oldMaxRenderIndex and ltoe maxRenderIndex
                if (maxRenderIndex > currentMaxRenderIndex) {
                    itemsToAdd = this.view.collection.slice(currentMaxRenderIndex + 1, maxRenderIndex + 1);
                }
            } else {
                //  Need to add items which are greater than currentMinRenderIndex and ltoe minRenderIndex
                if (minRenderIndex < currentMinRenderIndex) {
                    itemsToAdd = this.view.collection.slice(minRenderIndex, currentMinRenderIndex);
                }

                //  Need to remove items which are greater than the new maxRenderIndex
                if (maxRenderIndex < currentMaxRenderIndex) {
                    itemsToRemove = this.view.collection.slice(maxRenderIndex + 1, currentMaxRenderIndex + 1);
                }
            }

            if (itemsToAdd.length > 0 || itemsToRemove.length > 0) {
                //  When drag-and-dropping an item to the end of a SlidingRender-enabled CollectionView, the 
                //  drag-and-drop behavior will push the scrollTop to a length which is greater than the collection's length.
                //  This causes rendering issues - so, safeguard against this happening and simply do not attempt to re-render in this scenario.
                if (maxRenderIndex < this.view.collection.length + this.threshold) {
                    this.minRenderIndex = minRenderIndex;
                    this.maxRenderIndex = maxRenderIndex;

                    if (itemsToAdd.length > 0) {
                        var currentTotalRendered = (currentMaxRenderIndex - currentMinRenderIndex) + 1;
                        if (direction === Direction.Down) {
                            //  Items will be appended after oldMaxRenderIndex. 
                            this._addItems(itemsToAdd, currentMaxRenderIndex + 1, currentTotalRendered, true);
                        } else {
                            this._addItems(itemsToAdd, minRenderIndex, currentTotalRendered, false);
                        }
                    }

                    if (itemsToRemove.length > 0) {
                        this._removeItems(itemsToRemove);
                    }

                    this._setHeightPaddingTop();
                }
            }

            this.lastScrollTop = scrollTop;
        },

        _setHeightPaddingTop: function() {
            this._setPaddingTop();
            this._setHeight();
        },

        //  Adjust padding-top to properly position relative items inside of list since not all items are rendered.
        _setPaddingTop: function () {
            this.view.ui.childContainer.css('padding-top', this._getPaddingTop());
        },

        _getPaddingTop: function() {
            return this.minRenderIndex * this.childViewHeight;
        },

        //  Set the elements height calculated from the number of potential items rendered into it.
        //  Necessary because items are lazy-appended for performance, but scrollbar size changing not desired.
        _setHeight: function() {
            //  Subtracting minRenderIndex is important because of how CSS renders the element. If you don't subtract minRenderIndex
            //  then the rendered items will push up the height of the element by minRenderIndex * childViewHeight.
            var height = (this.view.collection.length - this.minRenderIndex) * this.childViewHeight;

            //  Keep height set to at least the viewport height to allow for proper drag-and-drop target - can't drop if height is too small.
            if (height < this.viewportHeight) {
                height = this.viewportHeight;
            }

            this.view.ui.childContainer.height(height);
        },

        _addItems: function(models, indexOffset, currentTotalRendered, isAddingToEnd) {
            var skippedCount = 0;

            var ChildView;
            _.each(models, function(model, index) {
                ChildView = this.view.getChildView(model);

                var shouldAdd = this._indexWithinRenderRange(index + indexOffset);

                if (shouldAdd) {
                    if (isAddingToEnd) {
                        //  Adjust the childView's index to account for where it is actually being added in the list
                        this._addChild(model, ChildView, index + currentTotalRendered - skippedCount, true);
                    } else {
                        //  Adjust the childView's index to account for where it is actually being added in the list, but
                        //  also provide the unmodified index because this is the location in the rendered childViewList in which it will be added.
                        this._addChild(model, ChildView, index, true);
                    }
                } else {
                    skippedCount++;
                }
            }, this);
        },
        
        //  Remove N items from the end of the render item list.
        _removeItemsByIndex: function(startIndex, countToRemove) {
            for (var index = 0; index < countToRemove; index++) {
                var item = this.view.collection.at(startIndex - index);
                var childView = this.view.children.findByModel(item);
                this.view.removeChildView(childView);
            }
        },

        _removeItems: function(models) {
            _.each(models, function(model) {
                var childView = this.view.children.findByModel(model);

                this.view.removeChildView(childView);
            }, this);
        },
        
        //  Overridden Marionette's internal method to loop through collection and show each child view.
        //  BUG: https://github.com/marionettejs/backbone.marionette/issues/2021
        _showCollection: function() {
            var viewIndex = 0;
            var ChildView;
            this.view.collection.each(function(child, index) {
                ChildView = this.view.getChildView(child);

                if (this._indexWithinRenderRange(index)) {
                    this.view.addChild(child, ChildView, viewIndex, true);
                    viewIndex += 1;
                }
            }, this);
        },
        
        //  The bypass flag is set when shouldAdd has already been determined elsewhere. 
        //  This is necessary because sometimes the view's model's index in its collection is different than the view's index in the collectionview.
        //  In this scenario the index has already been corrected before _addChild is called so the index isn't a valid indicator of whether the view should be added.
        _addChild: function(child, ChildView, index, bypass) {
            var shouldAdd = false;

            if (this.minRenderIndex > -1 && this.maxRenderIndex > -1) {
                shouldAdd = bypass || this._indexWithinRenderRange(index);
            }

            if (shouldAdd) {
                return Marionette.CompositeView.prototype.addChild.apply(this.view, arguments);
            }
        },

        _getMinRenderIndex: function(scrollTop) {
            var minRenderIndex = Math.floor(scrollTop / this.childViewHeight) - this.threshold;

            if (minRenderIndex < 0) {
                minRenderIndex = 0;
            }

            return minRenderIndex;
        },

        _getMaxRenderIndex: function(scrollTop) {
            //  Subtract 1 to make math 'inclusive' instead of 'exclusive'
            var maxRenderIndex = Math.ceil((scrollTop / this.childViewHeight) + (this.viewportHeight / this.childViewHeight)) - 1 + this.threshold;

            return maxRenderIndex;
        },

        //  Returns true if an childView at the given index would not be fully visible -- part of it rendering out of the top of the viewport.
        _indexOverflowsTop: function(index) {
            var position = index * this.childViewHeight;
            var scrollPosition = this.$el.scrollTop();

            var overflowsTop = position < scrollPosition;

            return overflowsTop;
        },

        _indexOverflowsBottom: function(index) {
            //  Add one to index because want to get the bottom of the element and not the top.
            var position = (index + 1) * this.childViewHeight;
            var scrollPosition = this.$el.scrollTop() + this.viewportHeight;

            var overflowsBottom = position > scrollPosition;

            return overflowsBottom;
        },

        _indexWithinRenderRange: function(index) {
            return index >= this.minRenderIndex && index <= this.maxRenderIndex;
        },
        
        //  TODO: An animation on this would be nice.
        //  Ensure that the active item is visible by setting the container's scrollTop to a position which allows it to be seen.
        _scrollToItem: function(item) {
            var itemIndex = this.view.collection.indexOf(item);

            var overflowsTop = this._indexOverflowsTop(itemIndex);
            var overflowsBottom = this._indexOverflowsBottom(itemIndex);

            //  Only scroll to the item if it isn't in the viewport.
            if (overflowsTop || overflowsBottom) {
                var scrollTop = 0;

                //  If the item needs to be made visible from the bottom, offset the viewport's height:
                if (overflowsBottom) {
                    //  Add 1 to index because want the bottom of the element and not the top.
                    scrollTop = (itemIndex + 1) * this.childViewHeight - this.viewportHeight;
                } else if (overflowsTop) {
                    scrollTop = itemIndex * this.childViewHeight;
                }

                this.$el.scrollTop(scrollTop);
            }
        },

        //  Reset min/max, scrollTop, paddingTop and height to their default values.
        _onCollectionReset: function() {
            this.$el.scrollTop(0);
            this.lastScrollTop = 0;

            this.minRenderIndex = this._getMinRenderIndex(0);
            this.maxRenderIndex = this._getMaxRenderIndex(0);

            this._setHeightPaddingTop();
        },

        _onCollectionRemove: function(item, collection, options) {
            //  TODO: just modify the index in anticipation of the view being removed rather than wrapping in a setTimeout.
            //  I've wrapped this in a setTimeout because the CollectionView has yet to remove the model which is being removed from the collection.
            //  Because of this, _renderElementAtIndex has an off-by-one error due to the presence of the view whose model is being removed.
            setTimeout(function() {
                //  When a rendered view is lost - render the next one since there's a spot in the viewport
                if (this._indexWithinRenderRange(options.index)) {
                    var rendered = this._renderElementAtIndex(this.maxRenderIndex);

                    //  If failed to render next item and there are previous items waiting to be rendered, slide view back 1 item
                    if (!rendered && this.minRenderIndex > 0) {
                        this.$el.scrollTop(this.lastScrollTop - this.childViewHeight);
                    }
                }

                this._setHeightPaddingTop();
            }.bind(this));
        },

        _onCollectionAdd: function(item, collection) {
            var index = collection.indexOf(item);

            var indexWithinRenderRange = this._indexWithinRenderRange(index);

            //  Subtract 1 from collection.length because, for instance, if our collection has 8 items in it
            //  and min-max is 0-7, the 8th item in the collection has an index of 7.
            //  Use a > comparator not >= because we only want to run this logic when the viewport is overfilled and not just enough to be filled.
            var viewportOverfull = collection.length - 1 > this.maxRenderIndex;

            //  If a view has been rendered and it pushes another view outside of maxRenderIndex, remove that view.
            if (indexWithinRenderRange && viewportOverfull) {
                //  Adding one because I want to grab the item which is outside maxRenderIndex. maxRenderIndex is inclusive.
                this._removeItemsByIndex(this.maxRenderIndex + 1, 1);
            }

            this._setHeightPaddingTop();
        },

        _onCollectionChangeActive: function(item, active) {
            if (active) {
                this._scrollToItem(item);
            }
        }
    });

    return SlidingRender;
});