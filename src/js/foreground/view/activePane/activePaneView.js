// TODO: Show a sign-in view.
define(function(require) {
  'use strict';

  var PaneType = require('foreground/enum/paneType');
  var PaneView = require('foreground/view/activePane/paneView');
  var ActivePaneTemplate = require('text!template/activePane/activePane.html');
  var ViewModelContainer = require('foreground/view/behavior/viewModelContainer');

  var ActivePaneView = Marionette.CollectionView.extend({
    className: 'activePane flexRow',
    childView: PaneView,
    template: _.template(ActivePaneTemplate),

    childViewOptions: function() {
      return {
        streamItems: StreamusFG.backgroundProperties.stream.get('items')
      };
    },

    behaviors: {
      ViewModelContainer: {
        behaviorClass: ViewModelContainer,
        viewModelNames: ['collection']
      }
    },

    filter: function(pane) {
      return pane.get('isVisible');
    },

    // Sort the panes such that the stream appears on the right side.
    viewComparator: function(pane) {
      return pane.get('type') === PaneType.Stream ? 1 : 0;
    },

    collectionEvents: {
      'change:isVisible': '_onChangeIsVisible'
    },

    // TODO: This isn't very performant. I render twice in a lot of scenarios when moving from isVisibile: false to isVisible: true.
    _onChangeIsVisible: function() {
      this.render();
    }
  });

  return ActivePaneView;
});