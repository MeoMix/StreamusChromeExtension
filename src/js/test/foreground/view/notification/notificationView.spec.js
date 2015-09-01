'use strict';
import NotificationView from 'foreground/view/notification/notificationView';
import Notification from 'foreground/model/notification/notification';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

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

  ViewTestUtility.ensureBasicAssumptions.call(this);
});