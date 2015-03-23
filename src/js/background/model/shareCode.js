define(function() {
    'use strict';

    var ShareCode = Backbone.Model.extend({
        defaults: {
            id: null,
            //  TODO: Remove this or use it?
            entityType: -1,
            entityId: null,
            shortId: null,
            urlFriendlyEntityTitle: ''
        },

        urlRoot: function() {
            return Streamus.serverUrl + 'ShareCode/';
        },

        copyUrl: function() {
            var shortId = this.get('shortId');
            var urlFriendlyEntityTitle = this.get('urlFriendlyEntityTitle');
            var shareUrl = 'https://streamus.com/share/playlist/' + shortId + '/' + urlFriendlyEntityTitle;

            Streamus.channels.clipboard.commands.trigger('copy:text', shareUrl);
        }
    });

    return ShareCode;
});