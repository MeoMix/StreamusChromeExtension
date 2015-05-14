define(function(require) {
    'use strict';

    var SignInManager = require('background/model/signInManager');
    var StreamItems = require('background/collection/streamItems');
    var Search = require('background/model/search');
    var SearchView = require('foreground/view/search/searchView');

    describe('SearchView', function() {
        beforeEach(function() {
            this.search = new Search();
            this.searchResults = this.search.get('results');
            this.signInManager = new SignInManager();
            this.streamItems = new StreamItems();

            this.searchView = new SearchView({
                model: this.search,
                collection: this.searchResults,
                streamItems: this.streamItems,
                signInManager: this.signInManager
            });

            this.searchView.render();
        });

        it('should not be able to save if there are no search results and the user is not signed in', function() {
            var canSave = this.searchView._canSave();
            expect(canSave).to.equal(false);
        });

        it('should not be able to save if there are no search results and the user is signed in', function() {
            this.signInManager.set('signedInUser', {});
            var canSave = this.searchView._canSave();
            expect(canSave).to.equal(false);
        });

        it('should not be able to save if there are search results, but the user is not signed in', function() {
            this.searchResults.add({});
            var canSave = this.searchView._canSave();
            expect(canSave).to.equal(false);
        });

        it('should be able to save if there are search results and the user is signed in', function() {
            this.signInManager.set('signedInUser', {});
            this.searchResults.add({});
            var canSave = this.searchView._canSave();
            expect(canSave).to.equal(true);
        });

        describe('when clicking the saveAll button', function() {
            beforeEach(function() {
                sinon.stub(this.searchView, '_showSaveSelectedSimpleMenu');
            });

            afterEach(function() {
                this.searchView._showSaveSelectedSimpleMenu.restore();
            });

            it('should create a saveSelectedSimpleMenu when able to save', function() {
                this.signInManager.set('signedInUser', {});
                this.searchResults.add({});

                this.searchView._onClickSaveAllButton();
                expect(this.searchView._showSaveSelectedSimpleMenu.calledOnce).to.equal(true);
            });

            it('should not create a saveSelectedSimpleMenu when unable to save', function() {
                this.searchView._onClickSaveAllButton();
                expect(this.searchView._showSaveSelectedSimpleMenu.calledOnce).to.equal(false);
            });
        });

        it('should not be able to play or add if there are no search results', function() {
            var canPlayOrAdd = this.searchView._canPlayOrAdd();
            expect(canPlayOrAdd).to.equal(false);
        });

        it('should be able to play or add if there are search results', function() {
            this.searchResults.add({});
            var canPlayOrAdd = this.searchView._canPlayOrAdd();
            expect(canPlayOrAdd).to.equal(true);
        });

        describe('when clicking the addAll button', function() {
            beforeEach(function() {
                sinon.stub(this.streamItems, 'addSongs');
            });

            afterEach(function() {
                this.streamItems.addSongs.restore();
            });

            it('should add songs when able to add', function() {
                this.searchResults.add({});

                this.searchView._onClickAddAllButton();
                expect(this.streamItems.addSongs.calledOnce).to.equal(true);
            });

            it('should not add songs when not able to add', function() {
                this.searchView._onClickSaveAllButton();
                expect(this.streamItems.addSongs.calledOnce).to.equal(false);
            });
        });

        describe('when clicking the playAll button', function() {
            beforeEach(function() {
                sinon.stub(this.streamItems, 'addSongs');
            });

            afterEach(function() {
                this.streamItems.addSongs.restore();
            });

            it('should add & play songs when able to play', function() {
                this.searchResults.add({});

                this.searchView._onClickAddAllButton();
                expect(this.streamItems.addSongs.calledOnce).to.equal(true);
            });

            it('should not add & play songs when not able to play', function() {
                this.searchView._onClickSaveAllButton();
                expect(this.streamItems.addSongs.calledOnce).to.equal(false);
            });
        });
    });
});