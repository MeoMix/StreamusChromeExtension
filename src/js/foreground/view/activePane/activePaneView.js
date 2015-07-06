// TODO: It's weird that I am pulling in views from other folders.
// TODO: Potentially show a 'sign in' view?
define(function(require) {
  'use strict';

  var PaneType = require('foreground/enum/paneType');
  var StreamView = require('foreground/view/stream/streamView');
  var ActivePlaylistAreaView = require('foreground/view/leftPane/activePlaylistAreaView');
  var ActivePaneTemplate = require('text!template/activePane/activePane.html');
  var ViewModelContainer = require('foreground/view/behavior/viewModelContainer');

  var ActivePaneView = Marionette.CollectionView.extend({
    className: 'activePane flexRow',
    template: _.template(ActivePaneTemplate),

    childViewOptions: function(model) {
      var childViewOptions = null;
      var paneType = model.get('type');

      switch (paneType) {
        case PaneType.Stream:
          childViewOptions = {
            model: model.get('relatedModel')
          };
          break;
        case PaneType.Playlist:
          childViewOptions = {
            model: model.get('relatedModel'),
            collection: model.get('relatedModel').get('items'),
            streamItems: StreamusFG.backgroundProperties.stream.get('items')
          };
          break;
        default:
          console.error('Unhandled pane type ' + paneType);
      }

      return childViewOptions;
    },

    getChildView: function(model) {
      var ChildView = null;
      var paneType = model.get('type');

      switch (paneType) {
        case PaneType.Stream:
          ChildView = StreamView;
          break;
        case PaneType.Playlist:
          ChildView = ActivePlaylistAreaView;
          break;
        default:
          console.error('Unhandled pane type ' + paneType);
      }

      return ChildView;
    },

    behaviors: {
      ViewModelContainer: {
        behaviorClass: ViewModelContainer,
        viewModelNames: ['collection']
      }
    },

    filter: function(model) {
      return model.get('isVisible');
    },

    collectionEvents: {
      'change:isVisible': '_onChangeIsVisible'
    },

    _onChangeIsVisible: function(pane, isVisible) {
      //if (isVisible) {
        this.render();
      //}
    }
  });

  return ActivePaneView;
});