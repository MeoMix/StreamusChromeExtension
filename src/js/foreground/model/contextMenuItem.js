define(function () {
    'use strict';

    var ContextMenuItem = BackboneForeground.Model.extend({
        defaults:  {
            text: '',
            disabled: false,
            title: '',
            onMouseDown: null
        }
    });

    return ContextMenuItem;
});