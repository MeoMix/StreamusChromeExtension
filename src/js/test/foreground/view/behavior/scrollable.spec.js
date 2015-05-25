define(function(require) {
    'use strict';

    var Scrollable = require('foreground/view/behavior/scrollable');

    xdescribe('Scrollable', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();

            var ScrollableView = Marionette.CompositeView.extend({
                template: _.template(''),
                behaviors: {
                    Scrollable: {
                        behaviorClass: Scrollable
                    }
                }
            });

            this.view = new ScrollableView();
            this.scrollable = this.view._behaviors[0];
        });

        afterEach(function() {
            this.view.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.view.render().el);

            _.forIn(this.scrollable.ui, function(element) {
                if (element.length === 0) {
                    console.error('Selector ' + element.selector + ' has length 0 on view', this.view.el);
                }

                expect(element.length).to.not.equal(0);
            }, this);
        });

        it('should setup properly after the view has been attached', function() {
            document.body.appendChild(this.documentFragment);

            //  Let the DOM acknowledge the new element.
            requestAnimationFrame(function() {
                this.documentFragment.appendChild(this.view.render().el);
                this.view.triggerMethod('show');
                this.view.triggerMethod('attach');

                //expect(this.scrollable.thumbHeight).not.to.equal(this.scrollable.defaults.thumbHeight);
                expect(this.scrollable.thumbHeight).not.to.equal(0);
                expect(this.scrollable.containerHeight).to.equal(this.scrollable.el.offsetHeight);
                //expect(this.scrollable.containerHeight).not.to.equal(this.scrollable.defaults.contentHeight);
                expect(this.scrollable.containerHeight).not.to.equal(0);
                expect(this.scrollable.contentHeight).to.equal(this.scrollable.el.scrollHeight);
                //expect(this.scrollable.contentHeight).not.to.equal(this.scrollable.defaults.contentHeight);
                expect(this.scrollable.contentHeight).not.to.equal(0);

                document.body.removeChild(this.documentFragment);
            }.bind(this));
        });
    });
});