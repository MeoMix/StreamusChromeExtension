'use strict';
import {Model} from 'backbone';

var Checkbox = Model.extend({
  defaults: {
    // Primary checkboxes are colored more boldly than secondary.
    primary: true,
    checked: false,
    checking: false,
    labelText: '',
    // Often times a checkbox has a 1:1 relationship with a model property.
    // Linking that property to its checkbox allows working with a collection of checkboxes more easily.
    property: '',
    iconOnLeft: false
  }
});

export default Checkbox;