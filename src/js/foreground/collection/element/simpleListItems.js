'use strict';
import {Collection} from 'backbone';
import SimpleListItem from 'foreground/model/element/simpleListItem';

var SimpleListItems = Collection.extend({
  model: SimpleListItem
});

export default SimpleListItems;