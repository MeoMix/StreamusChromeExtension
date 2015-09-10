import StreamControlBarView from 'foreground/view/streamControlBar/streamControlBarView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('StreamControlBarView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new StreamControlBarView({
      player: TestUtility.buildPlayer()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});