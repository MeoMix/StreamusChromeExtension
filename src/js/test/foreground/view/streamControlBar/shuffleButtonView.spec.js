import ShuffleButtonView from 'foreground/view/streamControlBar/shuffleButtonView';
import ShuffleButton from 'background/model/shuffleButton';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('ShuffleButtonView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new ShuffleButtonView({
      model: new ShuffleButton()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});