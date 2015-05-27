define(function(require) {
  'use strict';

  var Tooltipable = require('foreground/view/behavior/tooltipable');

  describe('Tooltipable', function() {
    beforeEach(function() {
      this.tooltipable = new Tooltipable();
    });

    it('should hide any tooltips when its view is destroyed', function() {
      sinon.stub(this.tooltipable, '_hideTooltip');
      this.tooltipable.onBeforeDestroy();

      expect(this.tooltipable._hideTooltip.calledOnce).to.equal(true);
      this.tooltipable._hideTooltip.restore();
    });

    it('should be able to mark a target as hovered', function() {
      sinon.stub(window, 'setTimeout');
      var target = document.createElement('div');
      target.setAttribute('data-tooltip-text', 'hello, world');
      this.tooltipable._ensureHovered(target);

      expect($(target).data('is-hovered')).to.equal(true);
      expect(window.setTimeout.calledOnce).to.equal(true);
      window.setTimeout.restore();
    });

    it('should not re-mark an already hovered target', function() {
      sinon.stub(window, 'setTimeout');
      var target = document.createElement('div');
      $(target).data('is-hovered', true);
      this.tooltipable._ensureHovered(target);

      expect(window.setTimeout.calledOnce).to.equal(false);
      window.setTimeout.restore();
    });

    it('should not mark a target which does not have tooltip text', function() {
      sinon.stub(window, 'setTimeout');
      var target = document.createElement('div');
      this.tooltipable._ensureHovered(target);

      expect(window.setTimeout.calledOnce).to.equal(false);
      window.setTimeout.restore();
    });

    it('should not mark a target which does has an empty string for tooltip text', function() {
      sinon.stub(window, 'setTimeout');
      var target = document.createElement('div');
      target.setAttribute('data-tooltip-text', '');
      this.tooltipable._ensureHovered(target);

      expect(window.setTimeout.calledOnce).to.equal(false);
      window.setTimeout.restore();
    });

    it('should be able to hide shown tooltips', function() {
      this.tooltipable.isShowingTooltip = true;
      this.tooltipable.mutationObserver = new MutationObserver(_.noop);
      this.tooltipable._hideTooltip();

      expect(this.tooltipable.isShowingTooltip).to.equal(false);
    });

    it('should set a mutation observer when watching a target', function() {
      var target = document.createElement('div');
      this.tooltipable._watchTooltipText(target, {});

      expect(this.tooltipable.mutationObserver).not.to.equal(null);
    });

    it('should indicate that a tooltip should not be shown if target is not hovered', function() {
      var target = document.createElement('div');
      var showTooltip = this.tooltipable._needShowTooltip(target);

      expect(showTooltip).to.equal(false);
    });

    it('should indicate that a tooltip should be shown if target is hovered and does not need an overflow check', function() {
      var target = document.createElement('div');
      $(target).data('is-hovered', true);
      var showTooltip = this.tooltipable._needShowTooltip(target);

      expect(showTooltip).to.equal(true);
    });

    it('should indicate that a tooltip should not be shown if target is hovered and fails an overflow check', function() {
      var target = document.createElement('div');
      $(target).data('is-hovered', true);
      target.setAttribute('data-ui', 'textTooltipable');
      var showTooltip = this.tooltipable._needShowTooltip(target);

      expect(showTooltip).to.equal(false);
    });

    it('should not throw an error if a hovered element is missing the data-ui attribute', function() {
      sinon.spy(this.tooltipable, '_needShowTooltip');
      var target = document.createElement('div');
      $(target).data('is-hovered', true);
      this.tooltipable._needShowTooltip(target);

      expect(this.tooltipable._needShowTooltip.threw()).to.equal(false);
      this.tooltipable._needShowTooltip.restore();
    });

    it('should be able to show a tooltip', function() {
      sinon.stub(StreamusFG.channels.tooltip.commands, 'trigger');
      this.tooltipable._showTooltip({}, '');

      expect(this.tooltipable.isShowingTooltip).to.equal(true);
      expect(StreamusFG.channels.tooltip.commands.trigger.calledOnce).to.equal(true);
      expect(StreamusFG.channels.tooltip.commands.trigger.calledWithMatch('show:tooltip', {})).to.equal(true);
      StreamusFG.channels.tooltip.commands.trigger.restore();
    });

    // phantomjs doesn't support MutationObserver until 2.0
    if (_.isUndefined(window._phantom)) {
      it('should be able to update a tooltip', function(done) {
        sinon.stub(this.tooltipable, '_updateTooltip');
        var target = document.createElement('div');
        this.tooltipable._watchTooltipText(target, {});

        target.setAttribute('data-tooltip-text', 'foo');

        // Let the mutation observer fire.
        _.defer(function() {
          expect(this.tooltipable._updateTooltip.calledOnce).to.equal(true);
          this.tooltipable._updateTooltip.restore();
          done();
        }.bind(this));
      });
    }
  });
});