define(function(require) {
    'use strict';

    var SimpleMenuView = require('foreground/view/simpleMenu/simpleMenuView');
    var SimpleMenu = require('foreground/model/simpleMenu/simpleMenu');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('SimpleMenuView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new SimpleMenuView({
                model: new SimpleMenu()
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});