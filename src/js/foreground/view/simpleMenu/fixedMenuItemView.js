define(function(require) {
    'use strict';

    var MenuItemTemplate = require('text!template/simpleMenu/menuItem.html');

    var FixedMenuItemView = Marionette.ItemView.extend({
        className: 'listItem listItem--small listItem--clickable listItem--selectable u-bordered--top',
        template: _.template(MenuItemTemplate),

        triggers: {
            'click': 'click:fixedMenuItem'
        }
    });

    return FixedMenuItemView;
});