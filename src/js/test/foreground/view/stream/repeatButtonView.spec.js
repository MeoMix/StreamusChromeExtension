define(function(require) {
    'use strict';

    var RepeatButtonView = require('foreground/view/stream/repeatButtonView');
    var RepeatButton = require('background/model/repeatButton');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('RepeatButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new RepeatButtonView({
                model: new RepeatButton()
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});