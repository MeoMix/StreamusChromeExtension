define(function () {
    'use strict';
    
    var ContextMenu = Backbone.Model.extend({
        defaults: {
            top: 0,
            left: 0
        }
    });

    return ContextMenu;
})