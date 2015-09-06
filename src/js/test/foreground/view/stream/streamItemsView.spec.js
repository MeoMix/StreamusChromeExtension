import StreamItemsView from 'foreground/view/stream/streamItemsView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('StreamItemsView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new StreamItemsView();
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});