define(function (require) {
    'use strict';

    var Switch = require('foreground/model/switch');

    var Switches = Backbone.Collection.extend({
        model: Switch
    });

    return Switches;
});