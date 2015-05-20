define(function(require) {
    'use strict';

    var SimpleMenuView = require('foreground/view/simpleMenu/simpleMenuView');
    var SimpleMenu = require('foreground/model/simpleMenu/simpleMenu');
    var SimpleMenuItems = require('foreground/collection/simpleMenu/simpleMenuItems');
    var SimpleMenuItem = require('foreground/model/simpleMenu/simpleMenuItem');

    var SimpleMenuRegion = Marionette.Region.extend({
        initialize: function() {
            this.listenTo(Streamus.channels.simpleMenu.commands, 'show:simpleMenu', this._showSimpleMenu);
        },

        _showSimpleMenu: function(options) {
            //  this.$el.height/width is null on first use, https://github.com/marionettejs/backbone.marionette/issues/1971.
            var $this = $(this.el);

            //  TODO: Maybe it's better to already have the objects vivified before triggering this event?
            var simpleMenuItems = new SimpleMenuItems(options.simpleMenuItems);
            var fixedMenuItem = _.isUndefined(options.fixedMenuItem) ? null : new SimpleMenuItem(_.extend({
                fixed: true
            }, options.fixedMenuItem));

            this.show(new SimpleMenuView({
                model: new SimpleMenu({
                    isContextMenu: options.isContextMenu,
                    reposition: true,
                    repositionData: {
                        top: options.top,
                        left: options.left,
                        containerHeight: $this.height(),
                        containerWidth: $this.width()
                    },
                    simpleMenuItems: simpleMenuItems,
                    fixedMenuItem: fixedMenuItem
                })
            }));
        }
    });

    return SimpleMenuRegion;
});