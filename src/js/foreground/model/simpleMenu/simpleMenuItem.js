define(function() {
    'use strict';

    var SimpleMenuItem = Backbone.Model.extend({
        defaults: {
            text: '',
            tooltipText: '',
            value: '',
            selected: false,
            active: false,
            disabled: false,
            //  TODO: This is a bit odd.
            onClick: _.noop
        }
    });

    return SimpleMenuItem;
});