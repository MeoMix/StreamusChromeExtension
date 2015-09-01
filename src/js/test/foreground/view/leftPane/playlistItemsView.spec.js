'use strict';
import PlaylistItemsView from 'foreground/view/leftPane/playlistItemsView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('PlaylistItemsView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new PlaylistItemsView();
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});