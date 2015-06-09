define(function(require) {
  'use strict';

  var SimpleMenuView = require('foreground/view/simpleMenu/simpleMenuView');
  var SimpleMenu = require('foreground/model/simpleMenu/simpleMenu');
  var SimpleMenuItems = require('foreground/collection/simpleMenu/simpleMenuItems');
  var SimpleMenuItem = require('foreground/model/simpleMenu/simpleMenuItem');

  var SimpleMenuRegion = Marionette.Region.extend({
    initialize: function() {
      this.listenTo(StreamusFG.channels.simpleMenu.commands, 'show:simpleMenu', this._showSimpleMenu);
    },

    _showSimpleMenu: function(options) {
      var simpleMenuItems = new SimpleMenuItems(options.simpleMenuItems);
      var fixedMenuItem = _.isUndefined(options.fixedMenuItem) ? null : new SimpleMenuItem(options.fixedMenuItem);

      this.show(new SimpleMenuView({
        model: new SimpleMenu({
          isContextMenu: options.isContextMenu,
          reposition: true,
          repositionData: {
            top: options.top,
            left: options.left,
            containerHeight: window.innerHeight,
            containerWidth: window.innerWidth
          },
          simpleMenuItems: simpleMenuItems,
          fixedMenuItem: fixedMenuItem
        })
      }));
    }
  });

  return SimpleMenuRegion;
});