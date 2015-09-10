import UpdateStreamusView from 'foreground/view/dialog/updateStreamusView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('UpdateStreamusView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new UpdateStreamusView();
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});