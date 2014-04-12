define([
    'background/collection/playlistItems',
    'foreground/collection/paginatedCollection',
    'test/testUtility'
], function (PlaylistItems, PaginatedCollection, TestUtility) {
    'use strict';

    describe('PaginatedCollection', function () {

        var items = [];
        for (var i = 0; i < 100; i++) {
            items.push(TestUtility.buildPlaylistItem());
        }

        var playlistItems = new PlaylistItems(items);

        //  TODO: If I try to call setCollection in initialize then models comes up empty.
        var paginatedCollection = new PaginatedCollection();
        paginatedCollection.setCollection(playlistItems);

        it('should have initialized properly', function () {
            expect(paginatedCollection.startPage).toEqual(1);
            expect(paginatedCollection.currentPage).toEqual(paginatedCollection.startPage);
        });

        it('should have loaded the initial page of models', function () {
            //  +1 on buffer because need to account for the forward buffer, but since it is first page, no previous buffer.
            expect(paginatedCollection.length).toEqual(paginatedCollection.pageSize * (paginatedCollection.pageBuffer + 1));
        });

        it('should be able to load the next page of items', function () {
            paginatedCollection.loadNextPage();

            //  +2 on pageBuffer to account for previous and next page loaded.
            expect(paginatedCollection.length).toEqual(paginatedCollection.pageSize * (paginatedCollection.pageBuffer + 2));
        });
    });

});

