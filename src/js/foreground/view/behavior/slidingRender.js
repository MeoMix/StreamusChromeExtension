define([
], function () {
    'use strict';

    var SlidingRender = Backbone.Marionette.Behavior.extend({
        
        collectionEvents: {
            'reset': '_reset',
            
            'remove': function(item, collection, options) {
                if (this._indexWithinRenderRange(options.index)) {
                    this._renderNextElement();
                }
                
                this._setHeightPaddingTop();
            },

            'add': function () {
                //  TODO: Remove an element if found outside of render index?
                this._setHeightPaddingTop();
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

        //  TODO: This might need to be moved back onto the CompositeView's if necessary?
        //appendHtml: function (collectionView, itemView, index) {
        //    var childrenContainer = collectionView.itemViewContainer ? collectionView.$(collectionView.itemViewContainer) : collectionView.$el;
        //    var children = childrenContainer.children();
        //    if (children.size() <= index) {
        //        childrenContainer.append(itemView.el);
        //    } else {
        //        children.eq(index).before(itemView.el);
        //    }
        //},

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
        },

        onRender: function () {
            console.log("Rendering! Setting height and paddingTop");
            this._setHeightPaddingTop();
        },

        //  When deleting an element from a list it's important to render the next element (if any) since
        //  usually this only happens during scroll, but positions change when removing.
        _renderNextElement: function () {
            if (this.view.collection.length >= this.maxRenderIndex) {
                var item = this.view.collection.at(this.maxRenderIndex - 1);
                var ItemView = this.getItemView(item);

                //  Adjust the itemView's index to account for where it is actually being added in the list
                this._addItemView(item, ItemView, this.maxRenderIndex - 1);
            }
        },

        _setRenderedElements: function (scrollTop) {
            //  TODO: Probably better to use .min/.max instead of calculate here:
            //  Figure out the range of items currently rendered:
            var oldMinRenderIndex = this._getMinRenderIndex(this.lastScrollTop);
            var oldMaxRenderIndex = this._getMaxRenderIndex(this.lastScrollTop);

            //  Figure out the range of items which need to be rendered:
            var minRenderIndex = this._getMinRenderIndex(scrollTop);
            var maxRenderIndex = this._getMaxRenderIndex(scrollTop);

            var itemsToAdd = [];
            var itemsToRemove = [];

            //  Append items in the direction being scrolled and remove items being scrolled away from.
            var direction = scrollTop > this.lastScrollTop ? 'down' : 'up';

            if (direction === 'down') {
                //  Need to remove items which are less than the new minRenderIndex
                if (minRenderIndex > oldMinRenderIndex) {
                    itemsToRemove = this.view.collection.slice(oldMinRenderIndex, minRenderIndex);
                }

                //  Need to add items which are greater than oldMaxRenderIndex and ltoe maxRenderIndex
                if (maxRenderIndex > oldMaxRenderIndex) {
                    itemsToAdd = this.view.collection.slice(oldMaxRenderIndex, maxRenderIndex);
                }
            } else {
                //  Need to add items which are greater than oldMinRenderIndex and ltoe minRenderIndex
                if (minRenderIndex < oldMinRenderIndex) {
                    itemsToAdd = this.view.collection.slice(minRenderIndex, oldMinRenderIndex);
                }

                //  Need to remove items which are greater than the new maxRenderIndex
                if (maxRenderIndex < oldMaxRenderIndex) {
                    itemsToRemove = this.view.collection.slice(maxRenderIndex, oldMaxRenderIndex);
                }
            }

            if (itemsToAdd.length > 0 || itemsToRemove.length > 0) {
                this.minRenderIndex = minRenderIndex;
                this.maxRenderIndex = maxRenderIndex;

                if (direction === 'down') {
                    //  Items will be appended from oldMaxRenderIndex forward. 
                    this._addItems(itemsToAdd, oldMaxRenderIndex, true);
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

        //  TODO: Pretty sure I still need to fix this so that it correctly sets it.
        //  Set the elements height calculated from the number of potential items rendered into it.
        //  Necessary because items are lazy-appended for performance, but scrollbar size changing not desired.
        _setHeight: function () {
            //  Subtracting minRenderIndex is important because of how CSS renders the element. If you don't subtract minRenderIndex
            //  then the rendered items will push up the height of the element by minRenderIndex * itemViewHeight.
            var height = (this.view.collection.length - this.minRenderIndex) * this.itemViewHeight;

            console.log("Height:", height);

            var paddingTop = this._getPaddingTop();
            console.log("padding top:", paddingTop);

            //  Keep height set to at least the viewport height to allow for proper drag-and-drop target - can't drop if height is too small.
            if (height < this.viewportHeight) {
                height = this.viewportHeight - height;
                console.log("Adjusted height:", height);
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

        _removeItems: function (models) {
            _.each(models, function (model) {
                var childView = this.view.children.findByModel(model);

                this.removeChildView(childView);
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
                this.view.addItemView.apply(this.view, arguments);
            }
        },

        _getMinRenderIndex: function (scrollTop) {
            var minRenderIndex = Math.floor(scrollTop / this.itemViewHeight);
            return minRenderIndex;
        },

        _getMaxRenderIndex: function (scrollTop) {
            var maxRenderIndex = Math.ceil((scrollTop / this.itemViewHeight) + (this.viewportHeight / this.itemViewHeight));
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
            return index >= this.minRenderIndex && index < this.maxRenderIndex;
        }
    });

    return SlidingRender;
});