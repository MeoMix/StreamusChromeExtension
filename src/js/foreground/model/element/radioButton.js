'use strict';
import {Model} from 'backbone';

var RadioButton = Model.extend({
  defaults: {
    checked: false,
    labelText: '',
    value: ''
  }
});

export default RadioButton;