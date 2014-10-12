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
        
        urlRoot: Streamus.serverUrl + 'ShareCode/',
        
        copyUrl: function() {
            var shortId = this.get('shortId');
            var urlFriendlyEntityTitle = this.get('urlFriendlyEntityTitle');
            var shareUrl = 'https://share.streamus.com/playlist/' + shortId + '/' + urlFriendlyEntityTitle;

            Backbone.Wreqr.radio.channel('clipboard').commands.trigger('copy:text', shareUrl);
        }
    });

    return ShareCode;
});