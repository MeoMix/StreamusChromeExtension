define(function(require) {
  'use strict';

  var NotificationTemplate = require('text!template/notification/notification.html');

  var NotificationView = Marionette.LayoutView.extend({
    id: 'notification',
    className: 'notification panel panel--bottom u-transitionable transition--fast u-zIndex--5',
    template: _.template(NotificationTemplate),

    hideTimeout: null,
    hideTimeoutDelay: 3000,

    initialize: function() {
      // Defer binding event listeners which will hide this view to ensure that events which
      // were responsible for showing it do not also result in hiding.
      _.defer(function() {
        if (!this.isDestroyed) {
          this.listenTo(StreamusFG.channels.element.vent, 'click', this._onElementClick);
        }
      }.bind(this));
    },

    onAttach: function() {
      this._setHideTimeout();

      requestAnimationFrame(function() {
        this.$el.addClass('is-visible');
      }.bind(this));
    },

    onBeforeDestroy: function() {
      this._clearHideTimeout();
    },

    _onElementClick: function() {
      this._hide();
    },

    _hide: function() {
      this._clearHideTimeout();
      this.$el.off('webkitTransitionEnd').one('webkitTransitionEnd', this._onTransitionOutComplete.bind(this));
      this.$el.removeClass('is-visible');
    },

    _onTransitionOutComplete: function() {
      this.destroy();
    },

    _setHideTimeout: function() {
      this.hideTimeout = setTimeout(this._hide.bind(this), this.hideTimeoutDelay);
    },

    _clearHideTimeout: function() {
      clearTimeout(this.hideTimeout);
    }
  });

  return NotificationView;
});