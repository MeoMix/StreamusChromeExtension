define(function() {
  'use strict';

  var Tooltipable = Marionette.Behavior.extend({
    ui: {
      // Children which need tooltips and do not need to take into account text overflowing.
      tooltipable: '[data-ui~=tooltipable]',
      // Children which need tooltips, but also need to take into account overflowing.
      textTooltipable: '[data-ui~=textTooltipable]'
    },

    // Whether view's element or a descendant is showing a tooltip
    isShowingTooltip: false,
    // Don't show tooltips immediately on hover, wait 250ms moment to provide better UX
    showTooltipDelay: 250,
    mutationObserver: null,

    events: {
      'mouseenter': '_onMouseEnter',
      'mouseleave': '_onMouseLeave',
      'mouseenter @ui.tooltipable': '_onMouseEnter',
      'mouseleave @ui.tooltipable': '_onMouseLeave',
      'mouseenter @ui.textTooltipable': '_onMouseEnter',
      'mouseleave @ui.textTooltipable': '_onMouseLeave'
    },

    onBeforeDestroy: function() {
      this._hideTooltip();
    },

    _onMouseEnter: function(event) {
      this._ensureHovered(event.currentTarget);
    },

    _onMouseLeave: function(event) {
      $(event.currentTarget).data('is-hovered', false);
      this._hideTooltip();
    },

    // Begin the process of showing a tooltip on a given target by ensuring the target wants a tooltip
    // Some parent views can implement the Tooltipable behavior for children without themselves needing a tooltip
    _ensureHovered: function(target) {
      var $target = $(target);

      if (!$target.data('is-hovered')) {
        $target.data('is-hovered', true);
        var text = $target.attr('data-tooltip-text');

        if (!_.isUndefined(text) && text !== '') {
          setTimeout(this._onShowTooltipTimeout.bind(this, target, text), this.showTooltipDelay);
        }
      }
    },

    _hideTooltip: function() {
      if (this.isShowingTooltip) {
        // Disconnect the event listener to prevent memory leaks
        this.mutationObserver.disconnect();
        this.mutationObserver = null;
        Streamus.channels.tooltip.commands.trigger('hide:tooltip');
        this.isShowingTooltip = false;
      }
    },

    // Once a small delay has finished, confirm that the tooltip needs to be shown
    // If it does need to be shown, show it and listen for potential changes to the tooltip's text
    _onShowTooltipTimeout: function(target, text) {
      var needShowTooltip = this._needShowTooltip(target);

      if (needShowTooltip) {
        var boundingClientRect = target.getBoundingClientRect();
        this._showTooltip(boundingClientRect, text);
        this._watchTooltipText(target, boundingClientRect);
      }
    },

    // Create a mutation observer which watches the target for changes to its tooltip-text data attribute.
    // If that attribute changes then refresh the tooltip to reflect the new text.
    _watchTooltipText: function(target, boundingClientRect) {
      var mutationObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          var newText = mutation.target.getAttribute(mutation.attributeName);
          this._updateTooltip(boundingClientRect, newText);
        }.bind(this));
      }.bind(this));

      mutationObserver.observe(target, {
        attributes: true,
        attributeFilter: ['data-tooltip-text'],
        subtree: false
      });

      this.mutationObserver = mutationObserver;
    },

    _needShowTooltip: function(target) {
      // If the user is still hovering the element after the delay then go ahead and confirm the tooltip should be shown.
      var showTooltip = $(target).data('is-hovered') || false;

      if (showTooltip) {
        // Some elements only want to show a tooltip if their text can't all be seen
        var uiDataAttribute = target.dataset.ui;
        var checkOverflow = !_.isUndefined(uiDataAttribute) && uiDataAttribute.indexOf('textTooltipable') !== -1;

        if (checkOverflow) {
          // If offsetWidth is less than scrollWidth then text is being clipped.
          showTooltip = target.offsetWidth < target.scrollWidth;
        }
      }

      return showTooltip;
    },

    // Notify the Tooltip Region that a tooltip should be shown at the given location with the given text.
    _showTooltip: function(boundingClientRect, text) {
      Streamus.channels.tooltip.commands.trigger('show:tooltip', {
        targetBoundingClientRect: boundingClientRect,
        text: text
      });
      this.isShowingTooltip = true;
    },

    // Tell the current visible tooltip to update its text instead of re-showing it which would cause it to flicker.
    _updateTooltip: function(boundingClientRect, text) {
      Streamus.channels.tooltip.commands.trigger('update:tooltip', {
        targetBoundingClientRect: boundingClientRect,
        text: text
      });
    }
  });

  return Tooltipable;
});