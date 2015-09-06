import DeleteListItemButtonView from 'foreground/view/listItemButton/deleteListItemButtonView';
import PlaylistItem from 'background/model/playlistItem';
import ListItemButton from 'foreground/model/listItemButton/listItemButton';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('DeleteListItemButtonView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new DeleteListItemButtonView({
      model: new ListItemButton(),
      playlistItem: new PlaylistItem()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});