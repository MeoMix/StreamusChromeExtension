define(function () {
    'use strict';

    //  TODO: Split this off into a Behavior for the multi-select stuff, I think.
    var MultiSelectCompositeView = Backbone.Marionette.CompositeView.extend({
        
        collectionEvents: {
            
            'reset': '_reset',

            //  TODO: Logic for min/max render adjustment when adding/removing? Necessary???? I think so?
            //'add': function (a, e) {

            //    console.log('a/e', a, e);
            //},
            //'remove:': function (a, e) {
            //    console.log('Item has been removed.', a, e);
                
            //},

            //  When adding/removing lots of items -- no need to run this continously. Just need the end result to be right.
            //'add remove': _.throttle(function () {
            //    this._setPaddingTop();
            //    this._setHeight();
            //}, 100)
        },
        
        ui: {
            list: '.list',
            listItem: '.list-item'
        },

        //  Enables progressive rendering of children by keeping track of indices which are currently rendered.
        minRenderIndex: 0,
        maxRenderIndex: 0,
        
        //  The height of a rendered itemView in px. Including padding/margin.
        itemViewHeight: 40,
        viewportHeight: -1,
        
        //  Keep track of where user is scrolling from to determine direction and amount changed.
        lastScrollTop: 0,
        
        addItemView: function (item, ItemView, index, indexOverride) {
            //  indexOverride is necessary because the 'actual' index of an item is different from its rendered position's index.
            var shouldAdd;
            if (_.isUndefined(indexOverride)) {
                shouldAdd = this._indexWithinRenderRange(index);
            } else {
                shouldAdd = this._indexWithinRenderRange(indexOverride);
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
        
        onFullyVisible: function () {
            var self = this;
            //  Throttle the scroll event because scrolls can happen a lot and don't need to re-calculate very often.
            this.ui.list.scroll(_.throttle(function () {
                self._setRenderedElements(this.scrollTop);
            }, 20));
        },

        initialize: function () {
            //  Allow N items to be rendered initially where N is how many items need to cover the viewport.
            this.minRenderIndex = this._getMinRenderIndex(0);
            this.maxRenderIndex = this._getMaxRenderIndex(0);
        },

        onRender: function () {
            this._setHeight();
        },
        
        //  When deleting an element from a list it's important to render the next element (if any) since
        //  usually this only happens during scroll, but positions change when removing.
        _renderNextElement: function() {

            console.log("Collection length:", this.collection.length);
            
            if (this.collection.length >= this.maxRenderIndex) {
                
                var item = this.collection.at(this.maxRenderIndex - 1);

                var ItemView = this.getItemView(item);

                //  Adjust the itemView's index to account for where it is actually being added in the list
                this.addItemView(item, ItemView, this.maxRenderIndex - 1);
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
                    itemsToRemove = this.collection.slice(oldMinRenderIndex, minRenderIndex);
                }

                //  Need to add items which are greater than oldMaxRenderIndex and ltoe maxRenderIndex
                if (maxRenderIndex > oldMaxRenderIndex) {
                    itemsToAdd = this.collection.slice(oldMaxRenderIndex, maxRenderIndex);
                }
            } else {
                //  Need to add items which are greater than oldMinRenderIndex and ltoe minRenderIndex
                if (minRenderIndex < oldMinRenderIndex) {
                    itemsToAdd = this.collection.slice(minRenderIndex, oldMinRenderIndex);
                }

                //  Need to remove items which are greater than the new maxRenderIndex
                if (maxRenderIndex < oldMaxRenderIndex) {
                    itemsToRemove = this.collection.slice(maxRenderIndex, oldMaxRenderIndex);
                }
            }

            if (itemsToAdd.length > 0 || itemsToRemove.length > 0) {
                this.minRenderIndex = minRenderIndex;
                this.maxRenderIndex = maxRenderIndex;

                console.log("min/max render index:", this.minRenderIndex, this.maxRenderIndex);

                if (direction === 'down') {
                    //  Items will be appended from oldMaxRenderIndex forward. 
                    this._addItems(itemsToAdd, oldMaxRenderIndex, true);
                } else {
                    this._addItems(itemsToAdd, minRenderIndex, false);
                }

                this._removeItems(itemsToRemove);

                this._setPaddingTop();
                this._setHeight();
            }

            this.lastScrollTop = scrollTop;
        },
        
        //  Reset min/max, paddingTop and height to their default values.
        _reset: function() {
            this.minRenderIndex = this._getMinRenderIndex(0);
            this.maxRenderIndex = this._getMaxRenderIndex(0);

            this._setPaddingTop();
            this._setHeight();
        },
        
        //  Adjust padding-top to properly position relative items inside of list since not all items are rendered.
        _setPaddingTop: function () {
            this.ui.itemContainer.css('padding-top', this._getPaddingTop());
        },
        
        _getPaddingTop: function () {
            return this.minRenderIndex * this.itemViewHeight;
        },
        
        //  Set the elements height calculated from the number of potential items rendered into it.
        //  Necessary because items are lazy-appended for performance, but scrollbar size changing not desired.
        _setHeight: function () {
            console.trace();
            //  Subtracting minRenderIndex is important because of how CSS renders the element. If you don't subtract minRenderIndex
            //  then the rendered items will push up the height of the element by minRenderIndex * itemViewHeight.
            var height = (this.collection.length - this.minRenderIndex) * this.itemViewHeight;

            console.log("Height:", height);

            var paddingTop = this._getPaddingTop();
            console.log("padding top:", paddingTop);

            //  Keep height set to at least the viewport height to allow for proper drag-and-drop target - can't drop if height is too small.
            if (height < this.viewportHeight) {
                height = this.viewportHeight - height;
                console.log("Adjusted height:", height);
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
        _indexOverflowsTop: function(index) {
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
        
        _indexWithinRenderRange: function(index) {
            return index >= this.minRenderIndex && index < this.maxRenderIndex;
        }
    });

    return MultiSelectCompositeView;
});