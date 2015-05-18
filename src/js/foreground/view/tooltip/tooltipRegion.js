define(function(require) {
    'use strict';

    var TooltipView = require('foreground/view/tooltip/tooltipView');
    var Tooltip = require('foreground/model/tooltip/tooltip');

    var TooltipRegion = Marionette.Region.extend({
        initialize: function() {
            this.listenTo(Streamus.channels.tooltip.commands, 'show:tooltip', this._showTooltip);
            this.listenTo(Streamus.channels.tooltip.commands, 'hide:tooltip', this._hideTooltip);
        },

        _showTooltip: function(options) {
            var tooltipView = new TooltipView({
                model: new Tooltip({
                    text: options.text
                })
            });

            this.show(tooltipView);

            //  Let the DOM update so that offsetWidth and offsetHeight return correct values
            requestAnimationFrame(this._setTooltipViewOffset.bind(this, tooltipView, options.targetBoundingClientRect));
        },

        _hideTooltip: function() {
            if (!_.isUndefined(this.currentView)) {
                this.currentView.hide();
            }
        },

        _setTooltipViewOffset: function(tooltipView, boundingClientRect) {
            var tooltipWidth = tooltipView.el.offsetWidth;
            var tooltipHeight = tooltipView.el.offsetHeight;

            //  Figure out the desired offset of the tooltip based on its dimensions, location, and the dimensions of its target
            var offset = this._getAdjustedOffset(boundingClientRect, tooltipWidth, tooltipHeight);
            tooltipView.showAtOffset(offset);
        },

        //  Perform math in an attempt to center the tooltip along the bottom of a given element.
        //  If it can't go along the bottom then flip it and place it along the top.
        //  If it can't fit in the center then shift it to the left or right until it fits.
        _getAdjustedOffset: function(boundingClientRect, tooltipWidth, tooltipHeight) {
            //  adjustY is a feel good value for how far below the target the tooltip should be offset.
            var adjustY = 8;
            var targetHeight = boundingClientRect.height;
            var targetWidth = boundingClientRect.width;
            var targetOffset = {
                top: boundingClientRect.top + targetHeight + adjustY,
                left: boundingClientRect.left + targetWidth / 2 - tooltipWidth / 2
            };

            var adjustedLeftOffset = this._shiftLeftOffset(targetOffset.left, window.innerWidth, tooltipWidth);
            var adjustedTopOffset = this._flipInvertTopOffset(targetOffset.top, window.innerHeight, adjustY, targetHeight, tooltipHeight);

            var adjustedOffset = {
                top: adjustedTopOffset,
                left: adjustedLeftOffset
            }

            return adjustedOffset;
        },

        //  Figure out whether the tooltip fits inside the viewport when centered over the target.
        //  If it is not inside the viewport then determine the amount of shifting it needs to fit.
        _shiftLeftOffset: function(leftOffset, viewportLength, tooltipWidth) {
            var adjustedLeftOffset = leftOffset;
            var overflow = leftOffset + tooltipWidth - viewportLength;

            //  Shift the tooltip left/right based on how much it needs to shift to be able to fit inside the viewport.
            if (leftOffset < 0) {
                adjustedLeftOffset -= leftOffset;
            } else if(overflow > 0) {
                adjustedLeftOffset -= overflow;
            }

            return adjustedLeftOffset;
        },

        //  Figure out whether the tooltip fits beneath the target. If not, get a new topOffset for it to be flipped.
        _flipInvertTopOffset: function(topOffset, viewportHeight, adjust, targetHeight, tooltipHeight) {
            var adjustedTopOffset = topOffset;
            var overflow = topOffset + tooltipHeight - viewportHeight;
            //  Double the adjust value because it has already been added once to topOffset before taking into account adjustments.
            //  So, need to double it when inverting to counter-act the existing amount.
            var flipInvertAmount = tooltipHeight + targetHeight + (adjust * 2);

            if (topOffset < 0) {
                //  This logic will move the tooltip from above the target to beneath the target.
                adjustedTopOffset += flipInvertAmount;
            }
            else if (overflow > 0) {
                //  This logic will move the tooltip from beneath the target to above the target.
                adjustedTopOffset -= flipInvertAmount;
            }

            return adjustedTopOffset;
        }
    });

    return TooltipRegion;
});