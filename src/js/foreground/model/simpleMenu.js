define(function () {
    'use strict';

    var SimpleMenu = Backbone.Model.extend({
        defaults: {
            fixedMenuItemTitle: ''
        }
    });

    return SimpleMenu;
});