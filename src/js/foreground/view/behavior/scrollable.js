define(function(require) {
  'use strict';

  var Utility = require('common/utility');

  // Gives an implementing view a custom scrollbar.
  // Handles adjusting the scrollbar's dimensions and moving the view around based
  // on user interactions with the DOM.
  var Scrollable = Marionette.Behavior.extend({
    defaults: {
      // The SlidingRender behavior modifies CollectionView functionality drastically.
      // It will trigger OnUpdateScrollbar events when it needs the scrollbar updated.
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
    isMouseDownOnTrack: false,

    ui: {
      track: '[data-ui~=track]',
      thumb: '[data-ui~=thumb]'
    },

    events: {
      'click': '_onClick',
      'wheel': '_onWheel',
      'mousedown @ui.track': '_onTrackMouseDown'
    },

    initialize: function() {
      this.listenTo(StreamusFG.channels.window.vent, 'resize', this._onWindowResize);
      // It's important to bind pre-emptively or attempts to call removeEventListener will fail to find the appropriate reference.
      this._onWindowMouseMove = this._onWindowMouseMove.bind(this);
      this._onWindowMouseUp = this._onWindowMouseUp.bind(this);
      // Provide a throttled version of _onWheel because wheel events can fire at a high rate.
      // https://developer.mozilla.org/en-US/docs/Web/Events/wheel
      this._onWheel = _.throttleFramerate(requestAnimationFrame, this._onWheel.bind(this));
      this._throttledUpdate = _.throttleFramerate(requestAnimationFrame, this._update.bind(this));
    },

    onRender: function() {
      this.$el.addClass('scrollbar-container');
      this._appendScrollbarElements();
    },

    onAttach: function() {
      //  SlidingRender will trigger onUpdateScrollbar once it has attached itself.
      if (!this.options.implementsSlidingRender) {
        this.currentListScrollTop = this.el.scrollTop;
        this._update();
      }
    },

    onUpdateScrollbar: function() {
      this.currentListScrollTop = this.el.scrollTop;
      this._update();
    },

    // Sorting a view can trigger a massive number of add/remove children.
    // So, it's a good idea to throttle update to allow for the bulk action to complete.
    onAddChild: function() {
      if (!this.options.implementsSlidingRender) {
        this._throttledUpdate();
      }
    },

    onRemoveChild: function() {
      if (!this.options.implementsSlidingRender) {
        this._throttledUpdate();
      }
    },

    onBeforeDestroy: function() {
      this._setWindowEventListeners(false);
    },

    // Move the list up/down as the user scrolls the mouse wheel.
    _onWheel: function(event) {
      var listScrollTop = this.currentListScrollTop + event.originalEvent.deltaY;
      this._scrollList(listScrollTop);
    },

    // Monitor changes to the user's mouse position after they begin clicking
    // on the scrollbar's track. Adjust the scroll position based on mouse movements.
    _onTrackMouseDown: function(event) {
      // Doesn't make sense to run this logic on right-click.
      if (event.button === 0) {
        this.isMouseDownOnTrack = true;
        StreamusFG.channels.scrollbar.vent.trigger('mouseDown');

        // Snap the thumb to the mouse's position, but only do so if the mouse isn't clicking the thumb.
        if (event.target !== this.ui.thumb[0]) {
          var containerScrollTop = event.offsetY - this.thumbHeight / 2;
          this._scrollContainer(containerScrollTop);
        }

        // Start keeping track of mouse movements to be able to adjust the thumb position as the mouse moves.
        this.mouseDownContainerScrollTop = this.currentContainerScrollTop;
        this._setWindowEventListeners(true);
      }

      // Normal scrollbars don't allow events to propagate outside of them.
      event.stopPropagation();
      event.preventDefault();
    },

    _onClick: function(event) {
      // Stifle the click event if the mouse was over the scrollbar and then released while over the parent element.
      // Since scrollbar interactions shouldn't cause events - no click should happen when releasing the mouse after dragging.
      if (this.isMouseDownOnTrack) {
        // Normal scrollbars don't allow events to propagate outside of them.
        event.stopPropagation();
        event.preventDefault();
      }

      this.isMouseDownOnTrack = false;
    },

    _onWindowMouseMove: function(event) {
      // No action is needed when moving the mouse along the X axis
      if (event.movementY !== 0) {
        this.totalMouseMovementY += event.movementY;
        // Derive new scrollTop from initial + total movement rather than currentScrollTop + movement.
        // If the user drags their mouse outside the container then current + movement will not equal initial + total movement.
        var containerScrollTop = this.mouseDownContainerScrollTop + this.totalMouseMovementY;
        this._scrollContainer(containerScrollTop);
      }
    },

    _onWindowMouseUp: function() {
      StreamusFG.channels.scrollbar.vent.trigger('mouseUp');
      this.totalMouseMovementY = 0;
      this._setWindowEventListeners(false);
    },

    _onWindowResize: function() {
      this._update();
    },

    // A view which implements the Scrollable behavior needs to be given a couple of DOM elements which
    // will be used for scrolling their parent element.
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
      // When the CollectionView is first initializing _update can fire before scrollbar has been initialized.
      // _update can be called through requestAnimatiomFrame which gives an opening for the view to be destroyed.
      if (!this.view.isDestroyed && this.view._isShown) {
        if (this.currentListScrollTop > 0) {
          // Reset the track's transform back to 0 so that offsetHeight and scrollHeight aren't impacted.
          // The transform value will be fixed once scrollContainer is called.
          this.ui.track[0].style.transform = 'translateY(0px)';
        }

        this._cacheElementState();
        this._updateElementState();
        this._scrollList(this.currentListScrollTop);
      }
    },

    // Add (temporarily) or remove mouse-monitoring events to the window.
    _setWindowEventListeners: function(isAdding) {
      var action = isAdding ? window.addEventListener : window.removeEventListener;
      action('mousemove', this._onWindowMouseMove);
      action('mouseup', this._onWindowMouseUp);
    },

    // Whether the list's content is overflowing.
    _getIsOverflowing: function() {
      return this.contentHeight > this.containerHeight;
    },

    // Read from values from the DOM and keep them cached to avoid performance penalties on checking repeatedly.
    _cacheElementState: function() {
      this.containerHeight = this.el.offsetHeight;
      this.contentHeight = this.el.scrollHeight;
      this.thumbHeight = this._getThumbHeight(this.containerHeight, this.contentHeight);
    },

    // Calculate the size of the thumb. It should accurately represent the ratio of containerHeight to contentHeight.
    _getThumbHeight: function(containerHeight, contentHeight) {
      var thumbHeight = 0;

      // When destroying a CollectionView all of the children can be removed just before the view itself is.
      // This will result in containerHeight and contentHeight both being zero - which is OK.
      if (containerHeight !== 0) {
        if (contentHeight === 0) {
          throw new Error('Expected contentHeight to be a non-zero value.');
        }

        // Derive the ratio between containerHeight and contentHeight and then scale that to the container.
        thumbHeight = containerHeight * containerHeight / contentHeight;
        thumbHeight = Math.max(thumbHeight, this.options.minThumbHeight);
      }

      return thumbHeight;
    },

    // Update the thumb size and trackbar state to reflect the cache's current state.
    _updateElementState: function() {
      this.ui.thumb.height(this.thumbHeight);
      this._toggleHiddenState();
    },

    // Don't show the scrollbar track if the list is not overflowing.
    _toggleHiddenState: function() {
      var isOverflowing = this._getIsOverflowing();
      this.ui.track.toggleClass('is-hidden', !isOverflowing);
    },

    // Converts a scrollTop value for the container to a scrollTop value for the list.
    _getListScrollTop: function(containerScrollTop) {
      var listScrollTop = 0;
      var isOverflowing = this._getIsOverflowing();

      if (isOverflowing) {
        listScrollTop = containerScrollTop * (this.contentHeight - this.containerHeight) / (this.containerHeight - this.thumbHeight);
      }

      return listScrollTop;
    },

    // Converts a scrollTop value for the list to a scrollTop value for the container.
    _getContainerScrollTop: function(listScrollTop) {
      var containerScrollTop = 0;
      var isOverflowing = this._getIsOverflowing();

      if (isOverflowing) {
        containerScrollTop = listScrollTop * (this.containerHeight - this.thumbHeight) / (this.contentHeight - this.containerHeight);
      }

      return containerScrollTop;
    },

    // Adjusts the scrollTop of the list and the container so that they reflect a given containerScrollTop value.
    _scrollContainer: function(containerScrollTop) {
      // Only allow the thumb to move down until it touches the base of the container.
      var maxContainerScrollTop = this.containerHeight - this.thumbHeight;
      containerScrollTop = Utility.ensureMinMax(containerScrollTop, 0, maxContainerScrollTop);
      var listScrollTop = this._getListScrollTop(containerScrollTop);

      this._updateScrollTop(listScrollTop, containerScrollTop);
    },

    // Adjusts the scrollTop of the list and the container so that they reflect a given listScrollTop value.
    _scrollList: function(listScrollTop) {
      // Only allow the list to move down until the last of its content is fully visible.
      var maxListScrollTop = this.contentHeight - this.containerHeight;
      listScrollTop = Utility.ensureMinMax(listScrollTop, 0, maxListScrollTop);
      var containerScrollTop = this._getContainerScrollTop(listScrollTop);

      this._updateScrollTop(listScrollTop, containerScrollTop);
    },

    // Update the track, thumb, and list positions to reflect given values and cache the newly represented values.
    _updateScrollTop: function(listScrollTop, containerScrollTop) {
      this.el.scrollTop = listScrollTop;
      this.ui.track[0].style.transform = 'translateY(' + listScrollTop + 'px)';
      this.ui.thumb[0].style.transform = 'translateY(' + containerScrollTop + 'px)';

      this.currentListScrollTop = listScrollTop;
      this.currentContainerScrollTop = containerScrollTop;
    }
  });

  return Scrollable;
});