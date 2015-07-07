// TODO: Show a sign-in view.
define(function(require) {
  'use strict';

  var ActivePaneType = require('foreground/enum/activePaneType');
  var ActivePaneView = require('foreground/view/activePane/activePaneView');
  var ActivePanesTemplate = require('text!template/activePane/activePanes.html');
  var ViewModelContainer = require('foreground/view/behavior/viewModelContainer');

  var ActivePanesView = Marionette.CollectionView.extend({
    className: 'activePanes flexRow',
    childView: ActivePaneView,
    template: _.template(ActivePanesTemplate),

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

    // Sort the panes such that the stream appears on the right side.
    viewComparator: function(activePane) {
      return activePane.get('type') === ActivePaneType.Stream ? 1 : 0;
    }
  });

  return ActivePanesView;
});