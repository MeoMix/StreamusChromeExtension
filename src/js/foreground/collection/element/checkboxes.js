import {Collection} from 'backbone';
import Checkbox from 'foreground/model/element/checkbox';

var Checkboxes = Collection.extend({
  model: Checkbox,

  isChecked: function(property) {
    return this.findWhere({
      property: property
    }).get('checked');
  }
});

export default Checkboxes;