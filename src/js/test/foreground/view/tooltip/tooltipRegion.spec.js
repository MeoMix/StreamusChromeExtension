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

      expect(this.tooltipRegion.hasView()).to.equal(true);
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
  });
});