define(function(require) {
    'use strict';

    var SearchResultView = require('foreground/view/search/searchResultView');
    var SearchResult = require('background/model/searchResult');
    var StreamItems = require('background/collection/streamItems');
    var Player = require('background/model/player');
    var Settings = require('background/model/settings');
    var YouTubePlayer = require('background/model/youTubePlayer');
    var ListItemType = require('common/enum/listItemType');
    var testUtility = require('test/testUtility');

    describe('SearchResultView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.searchResultView = new SearchResultView({
                model: new SearchResult({
                    song: testUtility.buildSong()
                }),
                streamItems: new StreamItems(),
                player: new Player({
                    settings: new Settings(),
                    youTubePlayer: new YouTubePlayer()
                }),
                type: ListItemType.SearchResult,
                //  TODO: parentId?
                parentId: ''
            });
        });

        afterEach(function() {
            this.searchResultView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.searchResultView.render().el);

            _.forIn(this.searchResultView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});