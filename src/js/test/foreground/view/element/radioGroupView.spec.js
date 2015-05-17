define(function(require) {
    'use strict';

    var RadioGroupView = require('foreground/view/element/radioGroupView');
    var RadioGroup = require('foreground/model/element/radioGroup');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('RadioGroupView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new RadioGroupView({
                model: new RadioGroup()
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});