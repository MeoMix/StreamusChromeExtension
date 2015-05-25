define(function(require) {
  'use strict';

  var EntityType = require('background/enum/entityType');

  var ShareCode = Backbone.Model.extend({
    defaults: {
      id: null,
      entityType: EntityType.None,
      entityId: null,
      shortId: null,
      urlFriendlyEntityTitle: ''
    },

    urlRoot: function() {
      return Streamus.serverUrl + 'ShareCode/';
    },

    copyUrl: function() {
      var entityType = this.get('entityType');
      var shortId = this.get('shortId');
      var urlFriendlyEntityTitle = this.get('urlFriendlyEntityTitle');
      var shareUrl = 'https://streamus.com/share/' + entityType + '/' + shortId + '/' + urlFriendlyEntityTitle;

      Streamus.channels.clipboard.commands.trigger('copy:text', shareUrl);
    }
  });

  return ShareCode;
});