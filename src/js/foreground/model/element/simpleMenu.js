define(function() {
    'use strict';

    var SimpleMenu = Backbone.Model.extend({
        defaults: {
            simpleMenuItems: null,
            fixedMenuItem: null,
            listItemHeight: 0
        }
    });

    return SimpleMenu;
});