define(function(require) {
  'use strict';

  var ActivePaneType = require('foreground/enum/activePaneType');
  var StreamView = require('foreground/view/stream/streamView');
  var ActivePlaylistAreaView = require('foreground/view/leftPane/activePlaylistAreaView');
  var ActivePaneTemplate = require('text!template/activePane/activePane.html');

  var ActivePaneView = Marionette.LayoutView.extend({
    className: 'activePane flexColumn',
    template: _.template(ActivePaneTemplate),

    regions: {
      content: 'content'
    },

    streamItems: null,

    initialize: function(options) {
      this.streamItems = options.streamItems;
    },

    onRender: function() {
      this._showContentView();
    },

    // Show a dynamically determined view inside of the content region.
    _showContentView: function() {
      var contentView = this._getContentView();
      this.showChildView('content', contentView);
    },

    // Returns an instantiated StreamView or ActivePlaylistAreaView depending on the pane's type.
    _getContentView: function() {
      var contentView;
      var relatedModel = this.model.get('relatedModel');
      var activePaneType = this.model.get('type');

      switch (activePaneType) {
        case ActivePaneType.Stream:
          contentView = new StreamView({
            model: relatedModel
          });
          break;
        case ActivePaneType.Playlist:
          contentView = new ActivePlaylistAreaView({
            model: relatedModel,
            collection: relatedModel.get('items'),
            streamItems: this.streamItems
          });
          break;
        default:
          throw new Error('Unhandled activePaneType' + activePaneType);
      }

      return contentView;
    }
  });

  return ActivePaneView;
});