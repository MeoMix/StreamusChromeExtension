define(function(require) {
  'use strict';

  var CollectionMultiSelect = require('background/mixin/collectionMultiSelect');
  var SearchResult = require('background/model/searchResult');

  var SearchResults = Backbone.Collection.extend({
    model: SearchResult,
    mixins: [CollectionMultiSelect],
    // SearchResults are unable to be destroyed by 'Delete' actions because they don't exist in a mutable collection.
    isImmutable: true,
    userFriendlyName: chrome.i18n.getMessage('searchResults'),

    addSongs: function(songs) {
      if (songs.length > 0) {
        var searchResults = this._mapSongsAsSearchResults(songs);
        this.add(searchResults);

        // Emit a custom event signaling items have been added.
        // Useful for not responding to add until all items have been added.
        this.trigger('add:completed', this);
      }
    },

    // Reset the collection with SearchResults derived from a collection, array, or individual Song
    resetSongs: function(songs) {
      var searchResults = this._mapSongsAsSearchResults(songs);
      this.reset(searchResults);
    },

    // Takes a collection, array, or individual Song model and returns an array of SearchResult models
    _mapSongsAsSearchResults: function(songs) {
      var searchResults = [];

      if (songs instanceof Backbone.Collection) {
        searchResults = songs.map(this._mapSongAsSearchResult.bind(this));
      } else if (_.isArray(songs)) {
        searchResults = _.map(songs, this._mapSongAsSearchResult.bind(this));
      } else {
        searchResults.push(this._mapSongAsSearchResult(songs));
      }

      return searchResults;
    },

    // Takes an individual Song model and returns a SearchResult model
    _mapSongAsSearchResult: function(song) {
      return new SearchResult({
        song: song,
        title: song.get('title')
      });
    }
  });

  return SearchResults;
});