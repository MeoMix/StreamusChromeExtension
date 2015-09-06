import PreviousButtonView from 'foreground/view/streamControlBar/previousButtonView';
import PreviousButton from 'background/model/previousButton';
import Stream from 'background/model/stream';
import RadioButton from 'background/model/radioButton';
import ShuffleButton from 'background/model/shuffleButton';
import RepeatButton from 'background/model/repeatButton';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('PreviousButtonView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();

    var player = TestUtility.buildPlayer();

    var shuffleButton = new ShuffleButton();
    var radioButton = new RadioButton();
    var repeatButton = new RepeatButton();

    this.view = new PreviousButtonView({
      model: new PreviousButton({
        player: player,
        shuffleButton: shuffleButton,
        repeatButton: repeatButton,
        stream: new Stream({
          player: player,
          shuffleButton: shuffleButton,
          radioButton: radioButton,
          repeatButton: repeatButton
        })
      })
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});