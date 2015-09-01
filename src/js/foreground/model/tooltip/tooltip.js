'use strict';
import {Model} from 'backbone';

var Tooltip = Model.extend({
  defaults: {
    text: '',
    top: 0,
    left: 0
  }
});

export default Tooltip;