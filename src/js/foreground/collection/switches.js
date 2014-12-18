define([
    'foreground/model/switch'
], function (Switch) {
    'use strict';

    var Switches = Backbone.Collection.extend({
        model: Switch
    });

    return Switches;
});