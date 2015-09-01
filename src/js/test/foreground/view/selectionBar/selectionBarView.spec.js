'use strict';
import SelectionBarView from 'foreground/view/selectionBar/selectionBarView';
import SelectionBar from 'foreground/model/selectionBar/selectionBar';
import StreamItems from 'background/collection/streamItems';
import SearchResults from 'background/collection/searchResults';
import SignInManager from 'background/model/signInManager';
import ActivePlaylistManager from 'background/model/activePlaylistManager';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('SelectionBarView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new SelectionBarView({
      model: new SelectionBar({
        streamItems: new StreamItems(),
        searchResults: new SearchResults(),
        signInManager: new SignInManager(),
        activePlaylistManager: new ActivePlaylistManager({
          signInManager: new SignInManager()
        })
      })
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});