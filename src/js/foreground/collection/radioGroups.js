define([
    'foreground/model/radioGroup'
], function (RadioGroup) {
    'use strict';

    var RadioGroups = Backbone.Collection.extend({
        model: RadioGroup,
        
        getByProperty: function(property) {
            return this.findWhere({ property: property });
        }
    });

    return RadioGroups;
});