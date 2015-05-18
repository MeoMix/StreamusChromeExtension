define(function(require) {
    'use strict';

    var RadioGroup = require('foreground/model/element/radioGroup');

    var RadioGroups = Backbone.Collection.extend({
        model: RadioGroup,
        
        getByProperty: function(property) {
            return this.findWhere({property: property});
        }
    });

    return RadioGroups;
});