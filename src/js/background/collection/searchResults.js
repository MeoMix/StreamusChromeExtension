import _ from 'common/shim/lodash.reference.shim';
import {Collection} from 'backbone';
import CollectionMultiSelect from 'background/mixin/collectionMultiSelect';
import SearchResult from 'background/model/searchResult';

var SearchResults = Collection.extend({
  model: SearchResult,
  mixins: [CollectionMultiSelect],
  // SearchResults are unable to be destroyed by 'Delete' actions because they don't exist in a mutable collection.
  isImmutable: true,
  userFriendlyName: chrome.i18n.getMessage('searchResults'),

  addVideos: function(videos) {
    if (videos.length > 0) {
      var searchResults = this._mapVideosAsSearchResults(videos);
      this.add(searchResults);

      // Emit a custom event signaling items have been added.
      // Useful for not responding to add until all items have been added.
      this.trigger('add:completed', this);
    }
  },

  // Reset the collection with SearchResults derived from a collection, array, or individual Video
  resetVideos: function(videos) {
    var searchResults = this._mapVideosAsSearchResults(videos);
    this.reset(searchResults);
  },

  // Takes a collection, array, or individual Video model and returns an array of SearchResult models
  _mapVideosAsSearchResults: function(videos) {
    var searchResults = [];

    if (videos instanceof Collection) {
      searchResults = videos.map(this._mapVideoAsSearchResult.bind(this));
    } else if (_.isArray(videos)) {
      searchResults = _.map(videos, this._mapVideoAsSearchResult.bind(this));
    } else {
      searchResults.push(this._mapVideoAsSearchResult(videos));
    }

    return searchResults;
  },

  // Takes an individual Video model and returns a SearchResult model
  _mapVideoAsSearchResult: function(video) {
    return new SearchResult({
      video: video
    });
  }
});

export default SearchResults;