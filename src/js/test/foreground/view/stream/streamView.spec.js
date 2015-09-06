import StreamView from 'foreground/view/stream/streamView';
import Stream from 'background/model/stream';
import ShuffleButton from 'background/model/shuffleButton';
import RadioButton from 'background/model/radioButton';
import RepeatButton from 'background/model/repeatButton';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('StreamView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new StreamView({
      model: new Stream({
        player: TestUtility.buildPlayer(),
        shuffleButton: new ShuffleButton(),
        radioButton: new RadioButton(),
        repeatButton: new RepeatButton()
      })
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});