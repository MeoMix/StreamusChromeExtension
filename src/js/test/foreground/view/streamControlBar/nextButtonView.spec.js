import NextButtonView from 'foreground/view/streamControlBar/nextButtonView';
import NextButton from 'background/model/nextButton';
import Stream from 'background/model/stream';
import RadioButton from 'background/model/radioButton';
import ShuffleButton from 'background/model/shuffleButton';
import RepeatButton from 'background/model/repeatButton';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('NextButtonView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();

    var shuffleButton = new ShuffleButton();
    var radioButton = new RadioButton();
    var repeatButton = new RepeatButton();

    this.view = new NextButtonView({
      model: new NextButton({
        stream: new Stream({
          player: TestUtility.buildPlayer(),
          shuffleButton: shuffleButton,
          radioButton: radioButton,
          repeatButton: repeatButton
        }),
        radioButton: radioButton,
        shuffleButton: shuffleButton,
        repeatButton: repeatButton
      })
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});