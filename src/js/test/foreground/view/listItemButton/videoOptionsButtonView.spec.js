import VideoOptionsButtonView from 'foreground/view/listItemButton/videoOptionsButtonView';
import ListItemButton from 'foreground/model/listItemButton/listItemButton';
import Video from 'background/model/video';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('VideoOptionsButtonView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new VideoOptionsButtonView({
      model: new ListItemButton(),
      video: new Video(),
      player: TestUtility.buildPlayer()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});