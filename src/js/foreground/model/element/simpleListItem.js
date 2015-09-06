import {Model} from 'backbone';

var SimpleListItem = Model.extend({
  defaults: function() {
    return {
      property: '',
      labelKey: '',
      value: '',
      options: []
    };
  }
});

export default SimpleListItem;