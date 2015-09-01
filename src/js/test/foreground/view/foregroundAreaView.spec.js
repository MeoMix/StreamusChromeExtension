'use strict';
import ForegroundAreaView from 'foreground/view/foregroundAreaView';
import AnalyticsManager from 'background/model/analyticsManager';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('ForegroundAreaView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new ForegroundAreaView({
      el: false,
      analyticsManager: new AnalyticsManager()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});