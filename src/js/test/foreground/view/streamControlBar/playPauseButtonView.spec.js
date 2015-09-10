import PlayPauseButtonView from 'foreground/view/streamControlBar/playPauseButtonView';
import PlayPauseButton from 'background/model/playPauseButton';
import StreamItems from 'background/collection/streamItems';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('PlayPauseButtonView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();

    var player = TestUtility.buildPlayer();

    this.view = new PlayPauseButtonView({
      model: new PlayPauseButton({
        player: player,
        streamItems: new StreamItems()
      }),
      player: player
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});