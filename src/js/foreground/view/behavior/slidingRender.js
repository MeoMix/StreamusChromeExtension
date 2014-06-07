define(function () {
    'use strict';

    var SlidingRender = Backbone.Marionette.Behavior.extend({
        
        collectionEvents: {
            'reset': '_reset',
            
            'remove': function (item, collection, options) {
                //  When a rendered view is lost - render the next one since there's a spot in the viewport
                if (this._indexWithinRenderRange(options.index)) {
                    var rendered = this._renderElementAtIndex(this.maxRenderIndex);

                    //  If failed to render next item and there are previous items waiting to be rendered, slide view back 1 item
                    if (!rendered && this.minRenderIndex > 0) {
                        this.ui.list.scrollTop(this.lastScrollTop - this.itemViewHeight);
                    }
                }
                
                this._setHeightPaddingTop();
            },

            'add': function (item, collection) {
                var index = collection.indexOf(item);
                var indexWithinRenderRange = this._indexWithinRenderRange(index);
                var viewportFull = collection.length >= this.maxRenderIndex;

                //  If a view has been rendered and it pushes another view outside of maxRenderIndex, remove that view.
                if (indexWithinRenderRange && viewportFull) {
                    //  Adding one because I want to grab the item which is outside maxRenderIndex. maxRenderIndex is inclusive.
                    this._removeItemsByIndex(this.maxRenderIndex + 1, 1);
                }

                this._setHeightPaddingTop();
            },
            
            'change:active': function (item, active) {
                if (active) {
                    this._scrollToItem(item);
                }
            }
        },
        
        ui: {
            list: '.list'
        },
        
        //  Enables progressive rendering of children by keeping track of indices which are currently rendered.
        minRenderIndex: 0,
        maxRenderIndex: 0,

        //  The height of a rendered itemView in px. Including padding/margin.
        itemViewHeight: 40,
        viewportHeight: -1,

        //  Keep track of where user is scrolling from to determine direction and amount changed.
        lastScrollTop: 0,
        
        onShow: function () {
            //  If the collection implements getActiveItem - scroll to the active item.
            if (this.view.collection.getActiveItem) {
                if (this.view.collection.length > 0) {
                    this._scrollToItem(this.view.collection.getActiveItem());
                }
            }
        },

        onFullyVisible: function () {
            var self = this;
            //  Throttle the scroll event because scrolls can happen a lot and don't need to re-calculate very often.
            this.ui.list.scroll(_.throttle(function () {
                self._setRenderedElements(this.scrollTop);
            }, 20));
        },

        initialize: function (options) {
            if (_.isUndefined(options) || _.isUndefined(options.viewportHeight)) throw "SlidingRender expects to be initialized with a viewportHeight";
            this.viewportHeight = options.viewportHeight;

            //  Allow N items to be rendered initially where N is how many items need to cover the viewport.
            this.minRenderIndex = this._getMinRenderIndex(0);
            this.maxRenderIndex = this._getMaxRenderIndex(0);
            
            //  IMPORTANT: Stub out the view's implementation of addItemView with the slidingRender version.
            this.view.addItemView = this._addItemView.bind(this);
            //  Since slidingRender appends before/after depending on scrollDirection it is important to use the indexed version of appendHtml.
            this.view.appendHtml = this._appendHtml;
        },

        onRender: function () {
            this._setHeightPaddingTop();
        },
        
        //  jQuery UI's sortable needs to be able to know the minimum rendered index. Whenever an external
        //  event requests the min render index -- return it!
        onGetMinRenderIndex: function() {
            this.view.triggerMethod('GetMinRenderIndexReponse', {
                minRenderIndex: this.minRenderIndex
            });
        },
        
        //  Whenever the viewport height is changed -- adjust the items which are currently rendered to match
        onSetViewportHeight: function (request) {
            this.viewportHeight = request.viewportHeight;

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
            }
            else if (indexDifference < 0) {
                //  Load N items
                for (var count = 0; count < Math.abs(indexDifference) ; count++) {
                    this._renderElementAtIndex(currentMaxRenderIndex + 1 + count);
                }
            }
            
            this._setHeightPaddingTop();
        },

        //  When deleting an element from a list it's important to render the next element (if any) since
        //  usually this only happens during scroll, but positions change when removing.
        _renderElementAtIndex: function (index) {
            var rendered = false;

            if (this.view.collection.length >= index) {
                var item = this.view.collection.at(index);
                var ItemView = this.view.getItemView(item);

                //  Adjust the itemView's index to account for where it is actually being added in the list
                this._addItemView(item, ItemView, index);
                rendered = true;
            }

            return rendered;
        },

        _setRenderedElements: function (scrollTop) {
            //  Figure out the range of items currently rendered:
            var currentMinRenderIndex = this.minRenderIndex;
            var currentMaxRenderIndex = this.maxRenderIndex;

            //  Figure out the range of items which need to be rendered:
            var minRenderIndex = this._getMinRenderIndex(scrollTop);
            var maxRenderIndex = this._getMaxRenderIndex(scrollTop);

            var itemsToAdd = [];
            var itemsToRemove = [];

            //  Append items in the direction being scrolled and remove items being scrolled away from.
            var direction = scrollTop > this.lastScrollTop ? 'down' : 'up';

            if (direction === 'down') {
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
                this.minRenderIndex = minRenderIndex;
                this.maxRenderIndex = maxRenderIndex;

                if (direction === 'down') {
                    //  Items will be appended after oldMaxRenderIndex. 
                    this._addItems(itemsToAdd, currentMaxRenderIndex + 1, true);
                } else {
                    this._addItems(itemsToAdd, minRenderIndex, false);
                }

                this._removeItems(itemsToRemove);
                this._setHeightPaddingTop();
            }

            this.lastScrollTop = scrollTop;
        },

        //  Reset min/max, scrollTop, paddingTop and height to their default values.
        _reset: function () {
            this.ui.list.scrollTop(0);
            this.lastScrollTop = 0;

            this.minRenderIndex = this._getMinRenderIndex(0);
            this.maxRenderIndex = this._getMaxRenderIndex(0);

            this._setHeightPaddingTop();
        },
        
        _setHeightPaddingTop: function() {
            this._setPaddingTop();
            this._setHeight();
        },

        //  Adjust padding-top to properly position relative items inside of list since not all items are rendered.
        _setPaddingTop: function () {
            this.view.ui.itemContainer.css('padding-top', this._getPaddingTop());
        },

        _getPaddingTop: function () {
            return this.minRenderIndex * this.itemViewHeight;
        },

        //  Set the elements height calculated from the number of potential items rendered into it.
        //  Necessary because items are lazy-appended for performance, but scrollbar size changing not desired.
        _setHeight: function () {
            //  Subtracting minRenderIndex is important because of how CSS renders the element. If you don't subtract minRenderIndex
            //  then the rendered items will push up the height of the element by minRenderIndex * itemViewHeight.
            var height = (this.view.collection.length - this.minRenderIndex) * this.itemViewHeight;

            //  Keep height set to at least the viewport height to allow for proper drag-and-drop target - can't drop if height is too small.
            if (height < this.viewportHeight) {
                height = this.viewportHeight;
            }

            this.view.ui.itemContainer.height(height);
        },

        _addItems: function (models, indexOffset, isAddingToEnd) {
            //  Leverage Marionette's style of rendering for performance.
            this.view.initRenderBuffer();
            this.view.startBuffering();

            var ItemView;
            _.each(models, function (model, index) {
                ItemView = this.view.getItemView(model);

                if (isAddingToEnd) {
                    //  Adjust the itemView's index to account for where it is actually being added in the list
                    this._addItemView(model, ItemView, index + indexOffset);
                } else {
                    //  Adjust the itemView's index to account for where it is actually being added in the list, but
                    //  also provide the unmodified index because this is the location in the rendered itemViewList in which it will be added.
                    this._addItemView(model, ItemView, index, index + indexOffset);
                }
            }, this);

            this.view.endBuffering();
        },
        
        //  Remove N items from the end of the render item list.
        _removeItemsByIndex: function (startIndex, countToRemove) {
            for (var index = 0; index < countToRemove; index++) {
                var item = this.view.collection.at(startIndex - index);
                var childView = this.view.children.findByModel(item);
                this.view.removeChildView(childView);
            }
        },

        _removeItems: function (models) {
            _.each(models, function (model) {
                var childView = this.view.children.findByModel(model);

                this.view.removeChildView(childView);
            }, this);
        },
        
        _addItemView: function (item, ItemView, index, indexOverride) {
            //  indexOverride is necessary because the 'actual' index of an item is different from its rendered position's index.
            var shouldAdd;
            if (_.isUndefined(indexOverride)) {
                shouldAdd = this._indexWithinRenderRange(index);
            } else {
                shouldAdd = this._indexWithinRenderRange(indexOverride);
            }

            if (shouldAdd) {
                Backbone.Marionette.CompositeView.prototype.addItemView.apply(this.view, arguments);
            }
        },
        
        _appendHtml: function (collectionView, itemView, index) {
            var childrenContainer = collectionView.itemViewContainer ? collectionView.$(collectionView.itemViewContainer) : collectionView.$el;
            var children = childrenContainer.children();
            if (children.size() <= index) {
                childrenContainer.append(itemView.el);
            } else {
                children.eq(index).before(itemView.el);
            }
        },

        _getMinRenderIndex: function (scrollTop) {
            var minRenderIndex = Math.floor(scrollTop / this.itemViewHeight);
            return minRenderIndex;
        },

        _getMaxRenderIndex: function (scrollTop) {
            var maxRenderIndex = Math.ceil((scrollTop / this.itemViewHeight) + (this.viewportHeight / this.itemViewHeight)) - 1;
            return maxRenderIndex;
        },

        //  Returns true if an itemView at the given index would not be fully visible -- part of it rendering out of the top of the viewport.
        _indexOverflowsTop: function (index) {
            var position = index * this.itemViewHeight;
            var scrollPosition = this.ui.list.scrollTop();

            var overflowsTop = position < scrollPosition;

            return overflowsTop;
        },

        _indexOverflowsBottom: function (index) {
            //  Add one to index because want to get the bottom of the element and not the top.
            var position = (index + 1) * this.itemViewHeight;
            var scrollPosition = this.ui.list.scrollTop() + this.viewportHeight;

            var overflowsBottom = position > scrollPosition;

            return overflowsBottom;
        },

        _indexWithinRenderRange: function (index) {
            return index >= this.minRenderIndex && index <= this.maxRenderIndex;
        },
        
        //  Ensure that the active item is visible by setting the container's scrollTop to a position which allows it to be seen.
        _scrollToItem: function (item) {
            var itemIndex = this.view.collection.indexOf(item);

            var overflowsTop = this._indexOverflowsTop(itemIndex);
            var overflowsBottom = this._indexOverflowsBottom(itemIndex);

            //  Only scroll to the item if it isn't in the viewport.
            if (overflowsTop || overflowsBottom) {
                var scrollTop = 0;

                //  If the item needs to be made visible from the bottom, offset the viewport's height:
                if (overflowsBottom) {
                    //  Add 1 to index because want the bottom of the element and not the top.
                    scrollTop = (itemIndex + 1) * this.itemViewHeight - this.viewportHeight;
                }
                else if (overflowsTop) {
                    scrollTop = itemIndex * this.itemViewHeight;
                }

                this.ui.list.scrollTop(scrollTop);
            }
        }
    });

    return SlidingRender;
});