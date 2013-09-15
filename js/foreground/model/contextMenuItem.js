define(function () {
    'use strict';

    var ContextMenuItem = Backbone.Model.extend({
        defaults: function () {
            return {
                position: -1,
                text: '',
                disabled: false,
                title: '',
                onClick: null
            };
        }
    });

    return ContextMenuItem;
});