import PlaylistItemView from 'foreground/view/leftPane/playlistItemView';
import PlaylistItem from 'background/model/playlistItem';
import StreamItems from 'background/collection/streamItems';
import ListItemType from 'common/enum/listItemType';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('PlaylistItemView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new PlaylistItemView({
      model: new PlaylistItem(),
      streamItems: new StreamItems(),
      player: TestUtility.buildPlayer(),
      type: ListItemType.PlaylistItem,
      parentId: 'playlistItems-list'
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});