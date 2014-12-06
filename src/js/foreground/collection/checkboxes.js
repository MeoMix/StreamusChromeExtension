define([
    'foreground/model/checkbox'
], function (Checkbox) {
    'use strict';

    var Checkboxes = Backbone.Collection.extend({
        model: Checkbox,
        
        isChecked: function (property) {
            return this.findWhere({ property: property }).get('checked');
        }
    });

    return Checkboxes;
});