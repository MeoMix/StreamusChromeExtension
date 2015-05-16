define(function(require) {
    'use strict';

    var NotificationView = require('foreground/view/notification/notificationView');
    var Notification = require('foreground/model/notification');

    describe('NotificationView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.notificationView = new NotificationView({
                model: new Notification()
            });
        });

        afterEach(function() {
            this.notificationView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.notificationView.render().el);

            _.forIn(this.notificationView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});