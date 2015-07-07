define(function(require) {
  'use strict';

  var ActivePanesRegion = require('foreground/view/activePane/activePanesRegion');

  describe('ActivePanesRegion', function() {
    beforeEach(function() {
      $('body').append('<div data-region=activePanes></div>');

      this.region = new ActivePanesRegion({
        el: '[data-region=activePanes]'
      });
    });

    afterEach(function() {
      this.region.empty();
      $('body').remove('[data-region=activePanes]');
    });

    describe('_onForegroundAreaRendered', function() {
      it('should call _showActivePanesView', function() {
        sinon.stub(this.region, '_showActivePanesView');
        this.region._onForegroundAreaRendered();
        expect(this.region._showActivePanesView.calledOnce).to.equal(true);
        this.region._showActivePanesView.restore();
      });
    });

    describe('_showActivePanesView', function() {
      it('should successfully show a view', function() {
        this.region._showActivePanesView();
        expect(this.region.hasView()).to.equal(true);
      });
    });
  });
});