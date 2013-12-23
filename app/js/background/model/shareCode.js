define([
    'background/model/settings'
], function (Settings) {
    'use strict';

    var ShareCode = Backbone.Model.extend({
        
        defaults: {
            id: null,
            entityType: -1,
            entityId: null,
            shortId: null,
            urlFriendlyEntityTitle: ''
        },
        
        urlRoot: Settings.get('serverURL') + 'ShareCode/'
    });

    return ShareCode;
});