'use strict';
import SignInManager from 'background/model/signInManager';
import StreamItems from 'background/collection/streamItems';
import Search from 'background/model/search';
import SearchView from 'foreground/view/search/searchView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('SearchView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();

    this.search = new Search();
    this.searchResults = this.search.get('results');
    this.signInManager = new SignInManager();
    this.streamItems = new StreamItems();

    this.view = new SearchView({
      model: this.search,
      collection: this.searchResults,
      streamItems: this.streamItems,
      signInManager: this.signInManager
    });

    this.view.render();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);

  it('should not be able to save if there are no search results and the user is not signed in', function() {
    var canSave = this.view._canSave();
    expect(canSave).to.equal(false);
  });

  it('should not be able to save if there are no search results and the user is signed in', function() {
    this.signInManager.set('signedInUser', {});
    var canSave = this.view._canSave();
    expect(canSave).to.equal(false);
  });

  it('should not be able to save if there are search results, but the user is not signed in', function() {
    this.searchResults.add(TestUtility.buildSearchResult());
    var canSave = this.view._canSave();
    expect(canSave).to.equal(false);
  });

  it('should be able to save if there are search results and the user is signed in', function() {
    this.signInManager.set('signedInUser', {});
    this.searchResults.add(TestUtility.buildSearchResult());
    var canSave = this.view._canSave();
    expect(canSave).to.equal(true);
  });

  describe('when clicking the saveAll button', function() {
    beforeEach(function() {
      sinon.stub(this.view, '_showSaveSelectedSimpleMenu');
    });

    afterEach(function() {
      this.view._showSaveSelectedSimpleMenu.restore();
    });

    it('should create a saveSelectedSimpleMenu when able to save', function() {
      this.signInManager.set('signedInUser', {});
      this.searchResults.add(TestUtility.buildSearchResult());

      this.view._onClickSaveAllButton();
      expect(this.view._showSaveSelectedSimpleMenu.calledOnce).to.equal(true);
    });

    it('should not create a saveSelectedSimpleMenu when unable to save', function() {
      this.view._onClickSaveAllButton();
      expect(this.view._showSaveSelectedSimpleMenu.calledOnce).to.equal(false);
    });
  });

  it('should not be able to play or add if there are no search results', function() {
    var canPlay = this.view._canPlay();
    var canAdd = this.view._canAdd();
    expect(canPlay).to.equal(false);
    expect(canAdd).to.equal(false);
  });

  it('should be able to play if there are search results', function() {
    this.searchResults.add(TestUtility.buildSearchResult());
    var canPlay = this.view._canPlay();
    expect(canPlay).to.equal(true);
  });

  describe('when clicking the addAll button', function() {
    beforeEach(function() {
      sinon.stub(this.streamItems, 'addVideos');
    });

    afterEach(function() {
      this.streamItems.addVideos.restore();
    });

    it('should add videos when able to add', function() {
      this.searchResults.add(TestUtility.buildSearchResult());

      this.view._onClickAddAllButton();
      expect(this.streamItems.addVideos.calledOnce).to.equal(true);
    });

    it('should not add videos when not able to add', function() {
      this.view._onClickSaveAllButton();
      expect(this.streamItems.addVideos.calledOnce).to.equal(false);
    });
  });

  describe('when clicking the playAll button', function() {
    beforeEach(function() {
      sinon.stub(this.streamItems, 'addVideos');
    });

    afterEach(function() {
      this.streamItems.addVideos.restore();
    });

    it('should add & play videos when able to play', function() {
      this.searchResults.add(TestUtility.buildSearchResult());

      this.view._onClickAddAllButton();
      expect(this.streamItems.addVideos.calledOnce).to.equal(true);
    });

    it('should not add & play videos when not able to play', function() {
      this.view._onClickSaveAllButton();
      expect(this.streamItems.addVideos.calledOnce).to.equal(false);
    });
  });
});