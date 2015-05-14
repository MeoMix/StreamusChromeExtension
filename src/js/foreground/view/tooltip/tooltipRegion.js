define(function(require) {
    'use strict';

    var TooltipView = require('foreground/view/tooltip/tooltipView');
    var Tooltip = require('foreground/model/tooltip');

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
            requestAnimationFrame(function() {
                var tooltipWidth = tooltipView.el.offsetWidth;
                var tooltipHeight = tooltipView.el.offsetHeight;

                //  Figure out the desired offset of the tooltip based on its dimensions, location, and the dimensions of its target
                var offset = this._getAdjustedOffset(options.targetBoundingClientRect, tooltipWidth, tooltipHeight);
                tooltipView.showAtOffset(offset);
            }.bind(this));
        },

        _hideTooltip: function() {
            //  TODO: I'd prefer doing this logic on the region itself, but making the region a panel conflicts with :hover once visible.
            if (!_.isUndefined(this.currentView)) {
                this.currentView.hide();
            }
        },

        //  Perform math in an attempt to center the tooltip along the bottom of a given element.
        //  If it can't go along the bottom then flip it and place it along the top.
        //  If it can't fit in the center then shift it to the left or right until it fits.
        _getAdjustedOffset: function(boundingClientRect, tooltipWidth, tooltipHeight) {
            var adjustY = 8;
            var targetHeight = boundingClientRect.height;
            var targetWidth = boundingClientRect.width;
            var targetOffset = {
                top: boundingClientRect.top + targetHeight + adjustY,
                left: boundingClientRect.left + targetWidth / 2 - tooltipWidth / 2
            };

            //  Note that these methods have side-effects on the targetOffset object.
            this._shiftLeftOffset(targetOffset, window.innerWidth, targetWidth, tooltipWidth);
            this._flipInvertTopOffset(targetOffset, window.innerHeight, adjustY, targetHeight, tooltipHeight);

            return targetOffset;
        },

        //  Credit to jquery.qtip2, http://qtip2.com/, for providing a lot of this math.
        //  I've stripped the given math **way** down to just my specific use case.
        
        //  Perform math to figure out whether the element needs to be shifted left/right and, if so, how much it needs to shift.
        _shiftLeftOffset: function(targetOffset, viewportLength, targetLength, tooltipLength) {
            var initialOffset = targetOffset.left;
            var myLength = -tooltipLength / 2;
            var overflow1 = -initialOffset;
            var overflow2 = initialOffset + tooltipLength - viewportLength;
            var offset = -myLength;

            // Adjust position but keep it within viewport dimensions
            targetOffset.left += overflow1 > 0 ? overflow1 : overflow2 > 0 ? -overflow2 : 0;
            targetOffset.left = Math.max(
                initialOffset - offset,
                Math.min(
                    Math.max(
                        viewportLength,
                        initialOffset + offset
                    ),
                    targetOffset.left,
                    // Make sure we don't adjust complete off the element when using 'center'
                    initialOffset - myLength
                )
            );
        },

        //  Perform math to figure out whether the element fits beneath the target. If not, flip it to the top.
        _flipInvertTopOffset: function(targetOffset, viewportLength, adjust, targetLength, tooltipLength) {
            var initialOffset = targetOffset.top;
            var overflow1 = -initialOffset;
            var overflow2 = initialOffset + tooltipLength - viewportLength;
            var offset = tooltipLength + targetLength;

            if (overflow1 > 0 && overflow2 > 0) {
                // Check for overflow on the left/top
                targetOffset.top -= offset + adjust;
            }
            else if (overflow2 > 0) {
                // Check for overflow on the left/top
                targetOffset.top -= offset + (adjust * 2);
            }
        }
    });

    return TooltipRegion;
});