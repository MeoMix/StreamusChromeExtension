define(function(require) {
    'use strict';

    var SaveStreamButtonView = require('foreground/view/stream/saveStreamButtonView');
    var SaveStreamButton = require('foreground/model/stream/saveStreamButton');
    var StreamItems = require('background/collection/streamItems');
    var SignInManager = require('background/model/signInManager');

    describe('SaveStreamButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.saveStreamButtonView = new SaveStreamButtonView({
                model: new SaveStreamButton({
                    streamItems: new StreamItems(),
                    signInManager: new SignInManager()
                })
            });
        });

        afterEach(function() {
            this.saveStreamButtonView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.saveStreamButtonView.render().el);

            _.forIn(this.saveStreamButtonView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});