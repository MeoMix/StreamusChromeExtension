define(function () {
    'use strict';

    var ContextMenuItem = Backbone.Model.extend({
        defaults:  {
            text: '',
            disabled: false,
            title: '',
            onClick: null
        }
    });

    return ContextMenuItem;
});