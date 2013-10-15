define([
    'addSearchResultOptionType'
], function (AddSearchResultOptionType) {
    'use strict';

    var AddSearchResultOption = Backbone.Model.extend({
        
        defaults: function () {
            return {
                title: '',
                type: AddSearchResultOptionType.NONE,
                entity: null
            };
        },
        
        initialize: function() {
            var self = this;

        }

    });

    return AddSearchResultOption;
});