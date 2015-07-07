define(function(require) {
  'use strict';

  var ActivePaneRegion = require('foreground/view/activePane/activePaneRegion');
  describe('ActivePaneRegion', function() {
    beforeEach(function() {
      $('body').append('<div data-region=activePane></div>');

      this.region = new ActivePaneRegion({
        el: '[data-region=activePane]'
      });
    });

    afterEach(function() {
      this.region.empty();
      $('body').remove('[data-region=activePane]');
    });

    describe('_onForegroundAreaRendered', function() {
      it('should call _showActivePaneView', function() {
        sinon.stub(this.region, '_showActivePaneView');
        this.region._onForegroundAreaRendered();
        expect(this.region._showActivePaneView.calledOnce).to.equal(true);
        this.region._showActivePaneView.restore();
      });
    });

    describe('_showActivePaneView', function() {
      it('should successfully show a view', function() {
        this.region._showActivePaneView();
        expect(this.region.hasView()).to.equal(true);
      });
    });
  });
});