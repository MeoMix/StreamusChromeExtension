define(function () {
    'use strict';

    var SimpleListItem = Backbone.Model.extend({
        defaults: {
            property: '',
            value: '',
            options: []
        },
        
        initialize: function() {
            
        }
    });

    return SimpleListItem;
});