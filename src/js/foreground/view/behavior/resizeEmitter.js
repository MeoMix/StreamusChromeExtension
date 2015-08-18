define(function() {
  'use strict';

  // There's a lack of support in modern browsers for being notified of a DOM element changing dimensions.
  // Provide this functionality by leveraging 'scroll' events attached to hidden DOM elements attached to
  // a given element.
  // http://stackoverflow.com/questions/19329530/onresize-for-div-elements/19418479#19418479
  var ResizeEmitter = Marionette.Behavior.extend({
    initialize: function() {
      window.addResizeListener = function(element, fn) {
        if (!element.__resizeTriggers__) {
          if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
          }
          element.__resizeLast__ = {};
          element.__resizeListeners__ = [];
          (element.__resizeTriggers__ = document.createElement('div')).className = 'resize-triggers';
          element.__resizeTriggers__.innerHTML = '<div class="expand-trigger"><div></div></div><div class="contract-trigger"></div>';
          element.appendChild(element.__resizeTriggers__);
          this._resetTriggers(element);
          element.addEventListener('scroll', this._scrollListener, true);
        }
        element.__resizeListeners__.push(fn);
      }.bind(this);

      window.removeResizeListener = function(element, fn) {
        element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
        if (!element.__resizeListeners__.length) {
          element.removeEventListener('scroll', this._scrollListener);
          element.__resizeTriggers__ = !element.removeChild(element.__resizeTriggers__);
        }
      }.bind(this);
    },

    _scrollListener: function(e) {
      var element = this;
      this._resetTriggers(this);
      if (this.__resizeRAF__) {
        cancelAnimationFrame(this.__resizeRAF__);
      }

      this.__resizeRAF__ = requestAnimationFrame(function() {
        if (this._checkTriggers(element)) {
          element.__resizeLast__.width = element.offsetWidth;
          element.__resizeLast__.height = element.offsetHeight;
          element.__resizeListeners__.forEach(function(fn) {
            fn.call(element, e);
          });
        }
      });
    },

    _checkTriggers: function(element) {
      return element.offsetWidth != element.__resizeLast__.width || element.offsetHeight != element.__resizeLast__.height;
    },

    _resetTriggers: function(element) {
      var triggers = element.__resizeTriggers__;
      var expand = triggers.firstElementChild;
      var contract = triggers.lastElementChild;
      var expandChild = expand.firstElementChild;

      contract.scrollLeft = contract.scrollWidth;
      contract.scrollTop = contract.scrollHeight;
      expandChild.style.width = expand.offsetWidth + 1 + 'px';
      expandChild.style.height = expand.offsetHeight + 1 + 'px';
      expand.scrollLeft = expand.scrollWidth;
      expand.scrollTop = expand.scrollHeight;
    }
  });

  return ResizeEmitter;
});