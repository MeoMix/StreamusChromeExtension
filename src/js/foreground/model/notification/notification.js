'use strict';
import {Model} from 'backbone';

var Notification = Model.extend({
  defaults: {
    message: ''
  }
});

export default Notification;