'use strict';
import PlayPauseVideoButtonView from 'foreground/view/listItemButton/playPauseVideoButtonView';
import StreamItems from 'background/collection/streamItems';
import ListItemButton from 'foreground/model/listItemButton/listItemButton';
import Video from 'background/model/video';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('PlayPauseVideoButtonView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new PlayPauseVideoButtonView({
      model: new ListItemButton(),
      video: new Video(),
      streamItems: new StreamItems(),
      player: TestUtility.buildPlayer()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});