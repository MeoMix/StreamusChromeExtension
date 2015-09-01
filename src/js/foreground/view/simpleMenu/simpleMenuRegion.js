'use strict';
import {Region} from 'marionette';
import SimpleMenuView from 'foreground/view/simpleMenu/simpleMenuView';
import SimpleMenu from 'foreground/model/simpleMenu/simpleMenu';
import SimpleMenuItems from 'foreground/collection/simpleMenu/simpleMenuItems';
import SimpleMenuItem from 'foreground/model/simpleMenu/simpleMenuItem';

var SimpleMenuRegion = Region.extend({
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

export default SimpleMenuRegion;