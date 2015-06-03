define(function(require) {
  'use strict';

  var DialogContent = require('foreground/view/behavior/dialogContent');

  var LinkUserIdView = Marionette.LayoutView.extend({
    template: _.template(chrome.i18n.getMessage('linkAccountsMessage')),

    behaviors: {
      DialogContent: {
        behaviorClass: DialogContent
      }
    }
  });

  return LinkUserIdView;
});