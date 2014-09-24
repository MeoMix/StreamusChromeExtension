define(function () {
    'use strict';

    var ShareCode = Backbone.Model.extend({
        defaults: {
            id: null,
            entityType: -1,
            entityId: null,
            shortId: null,
            urlFriendlyEntityTitle: ''
        },
        
        urlRoot: Streamus.serverUrl + 'ShareCode/'
    });

    return ShareCode;
});