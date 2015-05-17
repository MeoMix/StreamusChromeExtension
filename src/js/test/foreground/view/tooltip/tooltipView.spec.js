define(function(require) {
    'use strict';

    var TooltipView = require('foreground/view/tooltip/tooltipView');
    var Tooltip = require('foreground/model/tooltip/tooltip');

    describe('TooltipView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.tooltipView = new TooltipView({
                model: new Tooltip()
            });
        });

        afterEach(function() {
            this.tooltipView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.tooltipView.render().el);

            _.forIn(this.tooltipView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});