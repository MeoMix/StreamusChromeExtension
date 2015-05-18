define(function(require) {
    'use strict';

    var TooltipRegion = require('foreground/view/tooltip/tooltipRegion');
    var TooltipView = require('foreground/view/tooltip/tooltipView');

    describe('TooltipRegion', function() {

        beforeEach(function() {
            this.tooltipRegion = new TooltipRegion({
                el: document.createDocumentFragment()
            });
        });

        it('should be able to show a tooltip view', function() {
            sinon.stub(window, 'requestAnimationFrame');

            this.tooltipRegion._showTooltip({
                text: 'Hello, world',
                targetBoundingClientRect: {
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    width: 0,
                    height: 0
                }
            });

            expect(this.tooltipRegion.currentView).not.to.equal(undefined);
            expect(window.requestAnimationFrame.calledOnce).to.equal(true);

            window.requestAnimationFrame.restore();
        });

        it('should not throw an error if asked to hide a non-existing tooltip view', function() {
            sinon.spy(this.tooltipRegion, '_hideTooltip');
            this.tooltipRegion._hideTooltip();
            expect(this.tooltipRegion._hideTooltip.threw()).to.equal(false);
            this.tooltipRegion._hideTooltip.restore();
        });

        it('should be able to hide an existing view', function() {
            var tooltipView = new TooltipView();
            sinon.stub(tooltipView, 'hide');

            this.tooltipRegion.currentView = tooltipView;
            this.tooltipRegion._hideTooltip();
            expect(tooltipView.hide.calledOnce).to.equal(true);
            tooltipView.hide.restore();
        });

        it('should be able to set a tooltipview offset', function() {
            var tooltipView = new TooltipView();
            sinon.stub(tooltipView, 'showAtOffset');

            var boundingClientRect = {};
            this.tooltipRegion._setTooltipViewOffset(tooltipView, boundingClientRect);

            expect(tooltipView.showAtOffset.calledOnce).to.equal(true);
            tooltipView.showAtOffset.restore();
        });

        it('should be able to shift the left offset when it exceeds the right-side of the viewport', function() {
            var leftOffset = 950;
            var viewportWidth = 1000;
            var tooltipWidth = 100;

            var adjustedLeftOffset = this.tooltipRegion._shiftLeftOffset(leftOffset, viewportWidth, tooltipWidth);
            expect(adjustedLeftOffset).not.to.equal(leftOffset);
            expect(adjustedLeftOffset).to.equal(900);
        });

        it('should be able to shift the left offset when it exceeds the left-side of the viewport', function() {
            var leftOffset = -50;
            var viewportWidth = 1000;
            var tooltipWidth = 100;

            var adjustedLeftOffset = this.tooltipRegion._shiftLeftOffset(leftOffset, viewportWidth, tooltipWidth);
            expect(adjustedLeftOffset).not.to.equal(leftOffset);
            expect(adjustedLeftOffset).to.equal(0);
        });

        it('should be able to not shift the left offset when its left-edge fits in the viewport', function() {
            var leftOffset =  0;
            var viewportWidth = 1000;
            var tooltipWidth = 100;

            var adjustedLeftOffset = this.tooltipRegion._shiftLeftOffset(leftOffset, viewportWidth, tooltipWidth);
            expect(adjustedLeftOffset).to.equal(leftOffset);
        });

        it('should be able to not shift the left offset when its right-edge fits in the viewport', function() {
            var leftOffset = 900;
            var viewportWidth = 1000;
            var tooltipWidth = 100;

            var adjustedLeftOffset = this.tooltipRegion._shiftLeftOffset(leftOffset, viewportWidth, tooltipWidth);
            expect(adjustedLeftOffset).to.equal(leftOffset);
        });

        it('should be able to flipInvert the top offset when trying to position the element beneath the target', function() {
            var topOffset = 950;
            var viewportHeight = 1000;
            var adjust = 0;
            var targetHeight = 200;
            var tooltipHeight = 100;

            var adjustedTopOffset = this.tooltipRegion._flipInvertTopOffset(topOffset, viewportHeight, adjust, targetHeight, tooltipHeight);
            expect(adjustedTopOffset).not.to.equal(topOffset);
            expect(adjustedTopOffset).to.equal(650);
        });

        it('should be able to flipInvert the top offset when trying to position the element above the target', function() {
            var topOffset = -50;
            var viewportHeight = 1000;
            var adjust = 0;
            var targetHeight = 200;
            var tooltipHeight = 100;

            var adjustedTopOffset = this.tooltipRegion._flipInvertTopOffset(topOffset, viewportHeight, adjust, targetHeight, tooltipHeight);
            expect(adjustedTopOffset).not.to.equal(topOffset);
            expect(adjustedTopOffset).to.equal(250);
        });

        it('should be able to not flipInvert the top offset', function() {
            var topOffset = 0;
            var viewportHeight = 1000;
            var adjust = 0;
            var targetHeight = 200;
            var tooltipHeight = 100;

            var adjustedTopOffset = this.tooltipRegion._flipInvertTopOffset(topOffset, viewportHeight, adjust, targetHeight, tooltipHeight);
            expect(adjustedTopOffset).to.equal(topOffset);
        });
    });
});