import {Model} from 'backbone';
import ListItemType from 'common/enum/listItemType';

var SearchResult = Model.extend({
  defaults: function() {
    return {
      id: _.uniqueId('searchResult_'),
      selected: false,
      // Whether the item was the first to be selected or one of many.
      // Important for proper shift+click functionality.
      firstSelected: false,
      listItemType: ListItemType.SearchResult,
      video: null
    };
  }
});

export default SearchResult;