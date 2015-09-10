import {Model} from 'backbone';

var Switch = Model.extend({
  defaults: {
    checked: false,
    labelText: '',
    property: ''
  }
});

export default Switch;