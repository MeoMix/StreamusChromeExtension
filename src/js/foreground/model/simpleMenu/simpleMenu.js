'use strict';
import {Model} from 'backbone';

var SimpleMenu = Model.extend({
  defaults: {
    simpleMenuItems: null,
    fixedMenuItem: null,
    listItemHeight: 0,
    isContextMenu: false,
    reposition: false,
    repositionData: {
      top: 0,
      left: 0,
      containerHeight: 0,
      containerWidth: 0
    },
    offsetTop: 0,
    offsetLeft: 0
  }
});

export default SimpleMenu;