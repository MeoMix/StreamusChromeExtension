import {CollectionView} from 'marionette';
import ActivePaneType from 'foreground/enum/activePaneType';
import ActivePaneView from 'foreground/view/activePane/activePaneView';
import ActivePanesTemplate from 'template/activePane/activePanes.html!text';
import ViewEntityContainer from 'foreground/view/behavior/viewEntityContainer';

// TODO: Show a sign-in view.
var ActivePanesView = CollectionView.extend({
  className: 'activePanes flexRow',
  childView: ActivePaneView,
  template: _.template(ActivePanesTemplate),

  childViewOptions: function() {
    return {
      streamItems: StreamusFG.backgroundProperties.stream.get('items')
    };
  },

  behaviors: {
    ViewEntityContainer: {
      behaviorClass: ViewEntityContainer,
      viewEntityNames: ['collection']
    }
  },

  // Sort the panes such that the stream appears on the right side.
  viewComparator: function(activePane) {
    return activePane.get('type') === ActivePaneType.Stream ? 1 : 0;
  }
});

export default ActivePanesView;