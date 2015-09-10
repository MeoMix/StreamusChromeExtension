import AboutStreamusView from 'foreground/view/dialog/aboutStreamusView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('AboutStreamusView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new AboutStreamusView();
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});