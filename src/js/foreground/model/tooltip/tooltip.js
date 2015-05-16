define(function() {
    'use strict';

    var Tooltip = Backbone.Model.extend({
        defaults: {
            text: '',
            top: 0,
            left: 0
        }
    });

    return Tooltip;
});