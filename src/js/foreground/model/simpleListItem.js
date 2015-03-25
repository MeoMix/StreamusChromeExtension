define(function () {
    'use strict';

    var SimpleListItem = BackboneForeground.Model.extend({
        defaults: function () {
            return {
                property: '',
                labelKey: '',
                value: '',
                options: []
            };
        }
    });

    return SimpleListItem;
});