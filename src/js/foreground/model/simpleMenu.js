define(function () {
    'use strict';

    var SimpleMenu = BackboneForeground.Model.extend({
        defaults: {
            fixedMenuItemTitle: ''
        }
    });

    return SimpleMenu;
});