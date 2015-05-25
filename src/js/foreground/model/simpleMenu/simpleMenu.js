define(function() {
  'use strict';

  var SimpleMenu = Backbone.Model.extend({
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
      }
    }
  });

  return SimpleMenu;
});