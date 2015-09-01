'use strict';
import {Collection} from 'backbone';
import Switch from 'foreground/model/element/switch';

var Switches = Collection.extend({
  model: Switch
});

export default Switches;