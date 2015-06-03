define(function() {
  'use strict';

  var viewTestUtility = {
    ensureBasicAssumptions: function() {
      describe('Basic Assumptions', function() {
        it('should show', function() {
          this.documentFragment.appendChild(this.view.render().el);
          this.view.triggerMethod('show');
        });

        it('should be able to find all referenced ui targets', function() {
          this.documentFragment.appendChild(this.view.render().el);

          _.forIn(this.view.ui, function(element) {
            if (element.length === 0) {
              console.error('Selector ' + element.selector + ' has length 0 on view', this.view.el);
            }

            expect(element.length).to.not.equal(0);
          }, this);
        });
      });
    }
  };

  return viewTestUtility;
});