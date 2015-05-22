define(function() {
    'use strict';

    var SimpleMenuItem = Backbone.Model.extend({
        defaults: {
            text: '',
            value: null,
            active: false,
            disabled: false,
            fixed: false,
            onClick: _.noop
        }
    });

    return SimpleMenuItem;
});