define([
    'foreground/model/radioGroup'
], function (RadioGroup) {
    'use strict';

    var RadioGroups = Backbone.Collection.extend({
        model: RadioGroup
    });

    return RadioGroups;
});