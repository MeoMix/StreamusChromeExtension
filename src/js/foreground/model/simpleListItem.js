define(function () {
    'use strict';

    var SimpleListItem = Backbone.Model.extend({
        defaults: function () {
            return {
                property: '',
                value: '',
                options: []
            };
        }
    });

    return SimpleListItem;
});