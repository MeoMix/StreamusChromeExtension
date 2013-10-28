define(function () {
    'use strict';

    var ContextMenuItem = Backbone.Model.extend({
        defaults: function () {
            return {
                text: '',
                disabled: false,
                title: '',
                onClick: null
            };
        }
    });

    return ContextMenuItem;
});