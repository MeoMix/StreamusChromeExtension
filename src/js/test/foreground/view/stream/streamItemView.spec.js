'use strict';
import StreamItemView from 'foreground/view/stream/streamItemView';
import StreamItem from 'background/model/streamItem';
import StreamItems from 'background/collection/streamItems';
import PlayPauseButton from 'background/model/playPauseButton';
import ListItemType from 'common/enum/listItemType';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('StreamItemView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();

    var player = TestUtility.buildPlayer();

    this.view = new StreamItemView({
      model: new StreamItem(),
      player: player,
      playPauseButton: new PlayPauseButton({
        player: player,
        streamItems: new StreamItems()
      }),
      type: ListItemType.StreamItem,
      parentId: 'streamItems-list'
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});