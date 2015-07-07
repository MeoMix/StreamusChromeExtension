define(function(require) {
  'use strict';

  var PaneType = require('foreground/enum/paneType');
  var StreamView = require('foreground/view/stream/streamView');
  var ActivePlaylistAreaView = require('foreground/view/leftPane/activePlaylistAreaView');
  var PaneTemplate = require('text!template/activePane/pane.html');

  var PaneView = Marionette.LayoutView.extend({
    className: 'pane flexColumn',
    template: _.template(PaneTemplate),

    regions: {
      content: '[data-region=content]'
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

      switch (this.model.get('type')) {
        case PaneType.Stream:
          contentView = new StreamView({
            model: relatedModel
          });
          break;
        case PaneType.Playlist:
          contentView = new ActivePlaylistAreaView({
            model: relatedModel,
            collection: relatedModel.get('items'),
            streamItems: this.streamItems
          });
          break;
        default:
          throw new Error('Unhandled pane type ' + paneType);
      }

      return contentView;
    }
  });

  return PaneView;
});