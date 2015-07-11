define(function(require) {
  'use strict';

  var DialogContent = require('foreground/view/behavior/dialogContent');
  var ShuttingDownTemplate = require('text!template/dialog/shuttingDown.html');

  var ShuttingDownView = Marionette.LayoutView.extend({
    className: 'shuttingDown',
    template: _.template(ShuttingDownTemplate),

    behaviors: {
      DialogContent: {
        behaviorClass: DialogContent
      }
    },

    events: {
      'click a': '_onClickLink'
    },

    _onClickLink: function(event) {
      var href = event.target.href;
      StreamusFG.backgroundProperties.tabManager.showWebsite(href);
    }
  });

  return ShuttingDownView;
});