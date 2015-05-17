define(function(require) {
    'use strict';

    var ClearStreamButtonView = require('foreground/view/stream/clearStreamButtonView');
    var ClearStreamButton = require('foreground/model/stream/clearStreamButton');
    var StreamItems = require('background/collection/streamItems');

    describe('ClearStreamButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.clearStreamButtonView = new ClearStreamButtonView({
                model: new ClearStreamButton({
                    streamItems: new StreamItems()
                })
            });
        });

        afterEach(function() {
            this.clearStreamButtonView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.clearStreamButtonView.render().el);

            _.forIn(this.clearStreamButtonView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});