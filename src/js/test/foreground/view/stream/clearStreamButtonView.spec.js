define(function(require) {
    'use strict';

    var ClearStreamButtonView = require('foreground/view/stream/clearStreamButtonView');
    var ClearStreamButton = require('foreground/model/stream/clearStreamButton');
    var StreamItems = require('background/collection/streamItems');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('ClearStreamButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new ClearStreamButtonView({
                model: new ClearStreamButton({
                    streamItems: new StreamItems()
                })
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});