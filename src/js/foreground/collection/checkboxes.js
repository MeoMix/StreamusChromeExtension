define(function (require) {
    'use strict';

    var Checkbox = require('foreground/model/checkbox');

    var Checkboxes = Backbone.Collection.extend({
        model: Checkbox,
        
        isChecked: function (property) {
            return this.findWhere({ property: property }).get('checked');
        }
    });

    return Checkboxes;
});