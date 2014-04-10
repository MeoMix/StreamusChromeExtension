//  Just messing around with backbone.pageable to see how it works.

define([
    'background/model/playlistItem'
], function(PlaylistItem) {
    'use strict';

    var PageablePlaylistItems = Backbone.PageableCollection.extend({
        model: PlaylistItem,
        mode: 'client',
        state: {
            firstPage: 0,
            sortKey: 'sequence'
        }
    });
    
    var pageablePlaylistItems = new PageablePlaylistItems();
    
    for (var i = 0; i < 100; i++) {
        pageablePlaylistItems.add({
            sequence: i
        });
    }

    pageablePlaylistItems.fullCollection.sort();
    console.log("Pageable:", pageablePlaylistItems);

    pageablePlaylistItems.getNextPage();
    console.log("Pageable 2nd page:", pageablePlaylistItems.at(0).get('sequence'));
    
    pageablePlaylistItems.getNextPage();
    console.log("Pageable 3rd page:", pageablePlaylistItems.at(0).get('sequence'));
    
    pageablePlaylistItems.getNextPage();
    console.log("Pageable 4th page:", pageablePlaylistItems.at(0).get('sequence'));

});