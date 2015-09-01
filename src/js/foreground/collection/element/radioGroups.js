'use strict';
import {Collection} from 'backbone';
import RadioGroup from 'foreground/model/element/radioGroup';

var RadioGroups = Collection.extend({
  model: RadioGroup,

  getByProperty: function(property) {
    return this.findWhere({
      property: property
    });
  }
});

export default RadioGroups;