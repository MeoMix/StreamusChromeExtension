define(function(require) {
    'use strict';

    var SimpleMenuView = require('foreground/view/simpleMenu/simpleMenuView');
    var SimpleMenu = require('foreground/model/simpleMenu/simpleMenu');
    var SimpleMenuItems = require('foreground/collection/simpleMenu/simpleMenuItems');

    var SimpleMenuRegion = Marionette.Region.extend({
        initialize: function() {
            this.listenTo(Streamus.channels.simpleMenu.commands, 'show:simpleMenu', this._showSimpleMenu);
        },

        _showSimpleMenu: function(options) {
            //  this.$el.height/width is null on first use, https://github.com/marionettejs/backbone.marionette/issues/1971.
            var $this = $(this.el);

            this.show(new SimpleMenuView({
                model: new SimpleMenu({
                    reposition: true,
                    repositionData: {
                        top: options.top,
                        left: options.left,
                        containerHeight: $this.height(),
                        containerWidth: $this.width()
                    },
                    simpleMenuItems: new SimpleMenuItems(options.items)
                })
            }));
        }
    });

    return SimpleMenuRegion;
});