define(function(require) {
    'use strict';

    var NotificationView = require('foreground/view/notification/notificationView');
    var Notification = require('foreground/model/notification/notification');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('NotificationView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new NotificationView({
                model: new Notification()
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});