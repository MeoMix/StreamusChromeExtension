define([
    'settings'
], function (Settings) {
    'use strict';

    var shareCodeModel = Backbone.Model.extend({
        
        defaults: function () {
            return {
                id: null,
                entityType: -1,
                entityId: null,
                shortId: null,
                urlFriendlyEntityTitle: ''
            };
        },
        
        urlRoot: Settings.get('serverURL') + 'ShareCode/',
        
        initialize: function () {
            
        }
    });

    return function (config) {
        var shareCode = new shareCodeModel(config);

        return shareCode;
    };
});