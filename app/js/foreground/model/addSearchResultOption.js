define([
    'addSearchResultOptionType'
], function (AddSearchResultOptionType) {
    'use strict';

    var AddSearchResultOption = Backbone.Model.extend({
        
        defaults: function () {
            return {
                title: '',
                type: AddSearchResultOptionType.None,
                entity: null
            };
        }

    });

    return AddSearchResultOption;
});