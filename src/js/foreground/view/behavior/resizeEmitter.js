import _ from 'common/shim/lodash.reference.shim';
import {Behavior} from 'marionette';
import {behavior_resizeEmitter as ResizeEmitterTemplate} from 'common/templates';

// There's a lack of support in modern browsers for being notified of a DOM element changing dimensions.
// Provide this functionality by leveraging 'scroll' events attached to hidden DOM elements attached to
// a given element.
// http://stackoverflow.com/questions/19329530/onresize-for-div-elements/19418479#19418479
var ResizeEmitter = Behavior.extend({
  ui: {
    expand: 'expand',
    expandChild: 'expandChild',
    contract: 'contract'
  },

  lastKnownDimensions: {
    width: 0,
    height: 0
  },
  requestedAnimationFrame: null,

  initialize: function() {
    // Ensure that _onScroll event is bound before calling addEventListener to preserve function reference.
    _.bindAll(this, '_onScroll');
  },

  onRender: function() {
    // Append a hidden element which will trigger 'scroll' events whenever it resizes.
    this.$el.append(ResizeEmitterTemplate());
    // Need to rebind because the view's DOM was modified after render.
    this.view.bindUIElements();
  },

  onAttach: function() {
    this._ensurePosition();
    this._resetEmitterLayout();
    // This needs to be bound like so and not via events hash because scroll event won't propagate properly.
    this.el.addEventListener('scroll', this._onScroll, true);
  },

  onBeforeDestroy: function() {
    this.el.removeEventListener('scroll', this._onScroll);
    this._clearRequestedAnimationFrame();
  },

  // Whenever a scroll event is emitted - reset the emitter state and wait for a repaint so resize can be checked.
  _onScroll: function() {
    this._resetEmitterLayout();
    this._clearRequestedAnimationFrame();
    this.requestedAnimationFrame = requestAnimationFrame(this._onAnimationFrame.bind(this));
  },

  _onAnimationFrame: function() {
    this.requestedAnimationFrame = null;
    this._checkForResize();
  },

  // Announce a resize event if the previously known dimensions do not match the current dimensions.
  _checkForResize: function() {
    var width = this.el.offsetWidth;
    var height = this.el.offsetHeight;
    var isResized = width !== this.lastKnownDimensions.width || height !== this.lastKnownDimensions.height;

    if (isResized) {
      this.lastKnownDimensions.width = width;
      this.lastKnownDimensions.height = height;
      this.view.triggerMethod('resize');
    }
  },

  // Ensure the element's is able to contain an absolutely positioned resizeEmitter child.
  _ensurePosition: function() {
    if (getComputedStyle(this.el).position === 'static') {
      this.el.style.position = 'relative';
    }
  },

  // Setup the emitter's children's dimensions such that any document reflow will cause them to emit scroll events.
  _resetEmitterLayout: function() {
    var contract = this.ui.contract[0];
    contract.scrollLeft = contract.scrollWidth;
    contract.scrollTop = contract.scrollHeight;

    var expand = this.ui.expand[0];
    var expandChild = this.ui.expandChild[0];
    expandChild.style.width = expand.offsetWidth + 1 + 'px';
    expandChild.style.height = expand.offsetHeight + 1 + 'px';
    expand.scrollLeft = expand.scrollWidth;
    expand.scrollTop = expand.scrollHeight;
  },

  _clearRequestedAnimationFrame: function() {
    if (!_.isNull(this.requestedAnimationFrame)) {
      cancelAnimationFrame(this.requestedAnimationFrame);
    }
  }
});

export default ResizeEmitter;