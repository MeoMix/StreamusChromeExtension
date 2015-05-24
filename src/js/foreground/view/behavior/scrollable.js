define(function() {
    'use strict';

    var Scrollable = Marionette.Behavior.extend({
        defaults: {
            //  The SlidingRender behavior modifies CollectionView functionality drastically.
            //  It will trigger OnUpdateScrollbar events when it needs the scrollbar updated.
            implementsSlidingRender: false,
            minThumbHeight: 48
        },

        initialMouseDownPageY: 0,
        initialScrollTop: 0,
        lastKnownListScrollTop: 0,
        lastKnownContainerScrollTop: 0,
        containerHeight: 0,
        contentHeight: 0,
        thumbHeight: 0,

        ui: {
            track: '[data-ui~=track]',
            thumb: '[data-ui~=thumb]'
        },

        events: {
            'wheel': '_onWheel',
            'mousedown @ui.track': '_onTrackMousedown'
        },

        initialize: function() {
            this.listenTo(Streamus.channels.window.vent, 'resize', this._onWindowResize);

            this._onWindowMouseMove = this._onWindowMouseMove.bind(this);
            this._onWindowMouseUp = this._onWindowMouseUp.bind(this);
        },

        onRender: function() {
            this.$el.addClass('scrollbar-container');

            //  TODO: What's a better way to give it these elements?
            var scrollbarTrack = document.createElement('div');
            scrollbarTrack.classList.add('scrollbar-track');
            scrollbarTrack.setAttribute('data-ui', 'track');

            var scrollbarThumb = document.createElement('div');
            scrollbarThumb.classList.add('scrollbar-thumb');
            scrollbarThumb.setAttribute('data-ui', 'thumb');

            scrollbarTrack.appendChild(scrollbarThumb);
            this.el.appendChild(scrollbarTrack);

            this.ui.track = this.$(this.ui.track.selector);
            this.ui.thumb = this.$(this.ui.thumb.selector);
        },

        onAttach: function() {
            this._setDynamicValues();
        },

        onUpdateScrollbar: function() {
            this._update();
        },

        onListHeightUpdated: function() {
            requestAnimationFrame(this._update.bind(this));
        },

        onAddChild: function() {
            //if (!this.options.implementsSlidingRender) {
            //    this._update();
            //}
        },

        onRemoveChild: function() {
            //if (!this.options.implementsSlidingRender) {
            //    this._update();
            //}
        },

        onBeforeDestroy: function() {
            window.removeEventListener('mousemove', this._onWindowMouseMove);
            window.removeEventListener('mouseup', this._onWindowMouseUp);
        },

        _onWheel: function(event) {
            var deltaY = event.originalEvent.deltaY;
            var listScrollTop = this._ensureListScrollTop(this.lastKnownListScrollTop + deltaY);
            var containerScrollTop = this._listToContainer(listScrollTop);

            this._updateScrollTop(listScrollTop, containerScrollTop);
        },

        _onTrackMousedown: function(event) {
            //  Doesn't make sense to run this logic on right-click.
            if (event.button === 0) {
                //  Snap the thumb to the mouse's position, but only do so if the mouse isn't clicking the thumb.
                if (event.target !== this.ui.thumb[0]) {
                    var centeredScrollContainerTop = event.offsetY - this.thumbHeight / 2;
                    var containerScrollTop = this._ensureContainerScrollTop(centeredScrollContainerTop);
                    var listScrollTop = this._containerToList(containerScrollTop);

                    this._updateScrollTop(listScrollTop, containerScrollTop);
                }

                //  Start keeping track of mouse movements to be able to adjust the thumb position based on them.
                this.initialScrollTop = this.lastKnownContainerScrollTop;
                this.initialMouseDownPageY = event.pageY;
                window.addEventListener('mousemove', this._onWindowMouseMove);
                window.addEventListener('mouseup', this._onWindowMouseUp);
            }

            //  Normal scrollbars don't allow click events to propagate outside of them.
            event.preventDefault();
        },

        _onWindowMouseMove: function(event) {
            var deltaY = this.initialMouseDownPageY - event.pageY;

            //  User might be moving the mouse around right where they clicked
            if (deltaY !== 0) {
                var scrollTopData = this._mouseDeltaYToScrollTopData(this.initialScrollTop, deltaY);
                this._updateScrollTop(scrollTopData.listScrollTop, scrollTopData.containerScrollTop);
            }
        },

        _onWindowMouseUp: function() {
            //  TODO: prefer the ability to read from 'defaults'
            this.initialMouseDownPageY = 0;
            window.removeEventListener('mousemove', this._onWindowMouseMove);
            window.removeEventListener('mouseup', this._onWindowMouseUp);
        },

        _onWindowResize: function() {
            this._update();
        },

        _update: function() {
            //  When the CollectionView is first initializing _update can fire before scrollbar has been initialized.
            if (this.view._isShown) {
                this.ui.track[0].classList.add('is-hidden');
                this._setDynamicValues();

                var containerScrollTop = this._listToContainer(this.lastKnownListScrollTop);
                containerScrollTop = this._ensureContainerScrollTop(containerScrollTop);

                var listScrollTop = this._containerToList(containerScrollTop);
                listScrollTop = this._ensureListScrollTop(listScrollTop);

                this._updateScrollTop(containerScrollTop, listScrollTop);
            }
        },

        _getThumbHeight: function(containerHeight, contentHeight) {
            var proposedThumbHeight = containerHeight * containerHeight / contentHeight;
            var thumbHeight = Math.max(proposedThumbHeight, this.options.minThumbHeight);
            return thumbHeight;
        },

        _getIsOverflowing: function() {
            return this.contentHeight > this.containerHeight;
        },

        //  These variables need to be updated whenever the collection changes:
        _setDynamicValues: function() {
            this.containerHeight = this.el.offsetHeight;
            this.contentHeight = this.el.scrollHeight;

            this._toggleHiddenState();

            var thumbHeight = this._getThumbHeight(this.containerHeight, this.contentHeight);
            this.thumbHeight = thumbHeight;
            this.ui.thumb.height(thumbHeight);
        },

        _toggleHiddenState: function() {
            var isOverflowing = this._getIsOverflowing();
            this.ui.track.toggleClass('is-hidden', !isOverflowing);
        },

        _ensureListScrollTop: function(listScrollTop) {
            var ensuredListScrollTop = listScrollTop;
            var minScrollTop = 0;
            var maxScrollTop = this.contentHeight - this.containerHeight;

            if (listScrollTop < minScrollTop) {
                ensuredListScrollTop = minScrollTop;
            } else if (listScrollTop > maxScrollTop) {
                ensuredListScrollTop = maxScrollTop;
            }

            return ensuredListScrollTop;
        },

        _ensureContainerScrollTop: function(containerScrollTop) {
            var ensuredContainerScrollTop = containerScrollTop;
            var minScrollTop = 0;
            var maxScrollTop = this.containerHeight - this.thumbHeight;

            if (containerScrollTop < minScrollTop) {
                ensuredContainerScrollTop = minScrollTop;
            } else if (containerScrollTop > maxScrollTop) {
                ensuredContainerScrollTop = maxScrollTop;
            }

            return ensuredContainerScrollTop;
        },

        _containerToList: function(containerScrollTop) {
            var listScrollTop = 0;
            var isOverflowing = this._getIsOverflowing();

            if (isOverflowing) {
                listScrollTop = containerScrollTop * (this.contentHeight - this.containerHeight) / (this.containerHeight - this.thumbHeight);
            }

            return listScrollTop;
        },

        _listToContainer: function(listScrollTop) {
            var containerScrollTop = 0;
            var isOverflowing = this._getIsOverflowing();

            if (isOverflowing) {
                containerScrollTop = listScrollTop * (this.containerHeight - this.thumbHeight) / (this.contentHeight - this.containerHeight);
            }

            return containerScrollTop;
        },

        _mouseDeltaYToScrollTopData: function(initialScrollTop, deltaY) {
            var containerScrollTop = this._ensureContainerScrollTop(initialScrollTop - deltaY);
            //  Calculate scrollTop ratio between container:list
            var listScrollTop = this._containerToList(containerScrollTop);

            return {
                containerScrollTop: containerScrollTop,
                listScrollTop: listScrollTop
            };
        },

        _updateScrollTop: function(listScrollTop, containerScrollTop) {
            this.el.scrollTop = listScrollTop;
            this.ui.track[0].style.top = listScrollTop + 'px';
            this.ui.thumb[0].style.top = containerScrollTop + 'px';

            this.lastKnownListScrollTop = listScrollTop;
            this.lastKnownContainerScrollTop = containerScrollTop;
        }
    });

    return Scrollable;
});