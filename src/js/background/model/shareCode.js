import {Model} from 'backbone';
import EntityType from 'background/enum/entityType';

var ShareCode = Model.extend({
  defaults: {
    id: null,
    entityType: EntityType.None,
    entityId: null,
    shortId: null,
    urlFriendlyEntityTitle: ''
  },

  urlRoot: function() {
    return StreamusBG.serverUrl + 'ShareCode/';
  },

  copyUrl: function() {
    var entityType = this.get('entityType');
    var shortId = this.get('shortId');
    var urlFriendlyEntityTitle = this.get('urlFriendlyEntityTitle');
    var shareUrl = 'https://streamus.com/share/' + entityType + '/' + shortId + '/' + urlFriendlyEntityTitle;

    StreamusBG.channels.clipboard.commands.trigger('copy:text', shareUrl);
  }
});

export default ShareCode;