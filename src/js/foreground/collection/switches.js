define(function (require) {
    'use strict';

    var Switch = require('foreground/model/switch');

    var Switches = BackboneForeground.Collection.extend({
        model: Switch
    });

    return Switches;
});