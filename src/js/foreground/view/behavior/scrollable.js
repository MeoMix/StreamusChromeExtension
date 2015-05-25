define(function() {
    'use strict';

    var Scrollable = Marionette.Behavior.extend({
        defaults: {
            //  The SlidingRender behavior modifies CollectionView functionality drastically.
            //  It will trigger OnUpdateScrollbar events when it needs the scrollbar updated.
            implementsSlidingRender: false,
            minThumbHeight: 48
        },

        mouseDownContainerScrollTop: 0,
        totalMouseMovementY: 0,
        currentListScrollTop: 0,
        currentContainerScrollTop: 0,
        containerHeight: 0,
        contentHeight: 0,
        thumbHeight: 0,
        isMouseDown: false,

        ui: {
            track: '[data-ui~=track]',
            thumb: '[data-ui~=thumb]'
        },

        events: {
            'wheel': '_onWheel',
            'mousedown @ui.track': '_onTrackMouseDown',
            'click': '_onClick'
        },

        initialize: function() {
            this.listenTo(Streamus.channels.window.vent, 'resize', this._onWindowResize);
            this._onWindowMouseMove = this._onWindowMouseMove.bind(this);
            this._onWindowMouseUp = this._onWindowMouseUp.bind(this);
        },

        onRender: function() {
            this.$el.addClass('scrollbar-container');
            this._appendScrollbarElements();
        },

        onAttach: function() {
            this.currentListScrollTop = this.el.scrollTop;
            this._update();
        },

        onUpdateScrollbar: function() {
            this._update();
        },

        onListHeightUpdated: function() {
            requestAnimationFrame(this._update.bind(this));
        },

        onAddChild: function() {
            if (!this.options.implementsSlidingRender) {
                this._update();
            }
        },

        onRemoveChild: function() {
            if (!this.options.implementsSlidingRender) {
                this._update();
            }
        },

        onBeforeDestroy: function() {
            window.removeEventListener('mousemove', this._onWindowMouseMove);
            window.removeEventListener('mouseup', this._onWindowMouseUp);
        },

        //  Move the list up/down as the user scrolls the mouse wheel.
        _onWheel: function(event) {
            var deltaY = event.originalEvent.deltaY;
            var listScrollTop = this.currentListScrollTop + deltaY;

            this._scrollList(listScrollTop);
        },

        _onTrackMouseDown: function(event) {
            //  Doesn't make sense to run this logic on right-click.
            if (event.button === 0) {
                console.log('true');
                this.isMouseDown = true;
                Streamus.channels.scrollbar.vent.trigger('mouseDown');

                //  Snap the thumb to the mouse's position, but only do so if the mouse isn't clicking the thumb.
                if (event.target !== this.ui.thumb[0]) {
                    var containerScrollTop = event.offsetY - this.thumbHeight / 2;
                    this._scrollContainer(containerScrollTop);
                }

                //  Start keeping track of mouse movements to be able to adjust the thumb position as the mouse moves.
                this.mouseDownContainerScrollTop = this.currentContainerScrollTop;
                window.addEventListener('mousemove', this._onWindowMouseMove);
                window.addEventListener('mouseup', this._onWindowMouseUp);
            }

            //  Normal scrollbars don't allow events to propagate outside of them.
            event.stopPropagation();
            event.preventDefault();
        },

        _onClick: function(event) {
            //  Stifle the click event if the mouse was over the scrollbar and then released while over the parent element.
            //  Since scrollbar interactions shouldn't cause events - no click should happen when releasing the mouse after dragging.
            if (this.isMouseDown) {
                //  Normal scrollbars don't allow events to propagate outside of them.
                event.stopPropagation();
                event.preventDefault();
            }
        },

        _onWindowMouseMove: function(event) {
            //  No action is needed when moving the mouse along the X axis
            if (event.movementY !== 0) {
                this.totalMouseMovementY += event.movementY;
                //  Derive new scrollTop from initial + total movement rather than currentScrollTop + movement.
                //  If the user drags their mouse outside the container then current + movement will not equal initial + total movement.
                var containerScrollTop = this.mouseDownContainerScrollTop + this.totalMouseMovementY;
                this._scrollContainer(containerScrollTop);
            }
        },

        _onWindowMouseUp: function() {
            Streamus.channels.scrollbar.vent.trigger('mouseUp');
            this.totalMouseMovementY = 0;
            window.removeEventListener('mousemove', this._onWindowMouseMove);
            window.removeEventListener('mouseup', this._onWindowMouseUp);

            //  Set isMouseDown back to false only after the click event has completed.
            _.defer(function() {
                this.isMouseDown = false;
            }.bind(this));
        },

        _onWindowResize: function() {
            this._update();
        },

        //  A view which implements the Scrollable behavior needs to be given a couple of DOM elements which
        //  will be used for scrolling their parent element.
        _appendScrollbarElements: function() {
            var scrollbarTrack = document.createElement('div');
            scrollbarTrack.classList.add('scrollbar-track');
            scrollbarTrack.setAttribute('data-ui', 'track');

            var scrollbarThumb = document.createElement('div');
            scrollbarThumb.classList.add('scrollbar-thumb');
            scrollbarThumb.setAttribute('data-ui', 'thumb');

            scrollbarTrack.appendChild(scrollbarThumb);
            this.el.appendChild(scrollbarTrack);

            this.view.bindUIElements();
        },

        _update: function() {
            //  When the CollectionView is first initializing _update can fire before scrollbar has been initialized.
            if (this.view._isShown) {
                if (this.currentListScrollTop > 0) {
                    //  Reset the track's transform back to 0 so that offsetHeight and scrollHeight aren't impacted.
                    //  The transform value will be fixed once scrollContainer is called.
                    this.ui.track[0].style.transform = 'translateY(0px)';
                }

                this._cacheElementState();
                this._updateElementState();
                this._scrollList(this.currentListScrollTop);
            }
        },

        //  Whether the list's content is overflowing.
        _getIsOverflowing: function() {
            return this.contentHeight > this.containerHeight;
        },

        //  Read from values from the DOM and keep them cached to avoid performance penalties on checking repeatedly.
        _cacheElementState: function() {
            this.containerHeight = this.el.offsetHeight;
            this.contentHeight = this.el.scrollHeight;
            this.thumbHeight = this._getThumbHeight(this.containerHeight, this.contentHeight);
        },

        //  Calculate the size of the thumb. It should accurately represent the ratio of containerHeight to contentHeight.
        _getThumbHeight: function(containerHeight, contentHeight) {
            var thumbHeight = containerHeight * containerHeight / contentHeight;
            thumbHeight = Math.max(thumbHeight, this.options.minThumbHeight);
            return thumbHeight;
        },

        //  Update the thumb size and trackbar state to reflect the cache's current state.
        _updateElementState: function() {
            this.ui.thumb.height(this.thumbHeight);
            this._toggleHiddenState();
        },

        //  Don't show the scrollbar track if the list is not overflowing.
        _toggleHiddenState: function() {
            var isOverflowing = this._getIsOverflowing();
            this.ui.track.toggleClass('is-hidden', !isOverflowing);
        },

        //  Converts a scrollTop value for the container to a scrollTop value for the list.
        _getListScrollTop: function(containerScrollTop) {
            var listScrollTop = 0;
            var isOverflowing = this._getIsOverflowing();

            if (isOverflowing) {
                listScrollTop = containerScrollTop * (this.contentHeight - this.containerHeight) / (this.containerHeight - this.thumbHeight);
            }

            return listScrollTop;
        },

        //  Converts a scrollTop value for the list to a scrollTop value for the container.
        _getContainerScrollTop: function(listScrollTop) {
            var containerScrollTop = 0;
            var isOverflowing = this._getIsOverflowing();

            if (isOverflowing) {
                containerScrollTop = listScrollTop * (this.containerHeight - this.thumbHeight) / (this.contentHeight - this.containerHeight);
            }

            return containerScrollTop;
        },

        //  Adjusts the scrollTop of the list and the container so that they reflect a given containerScrollTop value.
        _scrollContainer: function(containerScrollTop) {
            //  Only allow the thumb to move down until it touches the base of the container.
            var maxContainerScrollTop = this.containerHeight - this.thumbHeight;
            containerScrollTop = this._ensureMinMax(containerScrollTop, 0, maxContainerScrollTop);
            var listScrollTop = this._getListScrollTop(containerScrollTop);

            this._updateScrollTop(listScrollTop, containerScrollTop);
        },

        //  Adjusts the scrollTop of the list and the container so that they reflect a given listScrollTop value.
        _scrollList: function(listScrollTop) {
            //  Only allow the list to move down until the last of its content is fully visible.
            var maxListScrollTop = this.contentHeight - this.containerHeight;
            listScrollTop = this._ensureMinMax(listScrollTop, 0, maxListScrollTop);
            var containerScrollTop = this._getContainerScrollTop(listScrollTop);

            this._updateScrollTop(listScrollTop, containerScrollTop);
        },

        //  Update the track, thumb, and list positions to reflect given values and cache the newly represented values.
        _updateScrollTop: function(listScrollTop, containerScrollTop) {
            this.el.scrollTop = listScrollTop;
            this.ui.track[0].style.transform = 'translateY(' + listScrollTop + 'px)';
            this.ui.thumb[0].style.transform = 'translateY(' + containerScrollTop + 'px)';

            this.currentListScrollTop = listScrollTop;
            this.currentContainerScrollTop = containerScrollTop;
        },

        //  Takes a given value and ensures that it falls within minimum/maximum values.
        _ensureMinMax: function(value, min, max) {
            value = Math.max(min, value);
            value = Math.min(value, max);
            return value;
        }
    });

    return Scrollable;
});