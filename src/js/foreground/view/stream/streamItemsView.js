import {CompositeView} from 'marionette';
import ListItemType from 'common/enum/listItemType';
import CollectionViewMultiSelect from 'foreground/view/behavior/collectionViewMultiSelect';
import Scrollable from 'foreground/view/behavior/scrollable';
import SlidingRender from 'foreground/view/behavior/slidingRender';
import Sortable from 'foreground/view/behavior/sortable';
import Tooltipable from 'foreground/view/behavior/tooltipable';
import StreamItemView from 'foreground/view/stream/streamItemView';
import {stream_streamItems as StreamItemsTemplate} from 'common/templates';

var StreamItemsView = CompositeView.extend({
  id: 'streamItems',
  className: 'list u-flex--full',
  template: StreamItemsTemplate,
  childViewContainer: '@ui.listItems',
  childView: StreamItemView,
  childViewType: ListItemType.StreamItem,
  childViewOptions: function() {
    return {
      player: StreamusFG.backgroundProperties.player,
      playPauseButton: StreamusFG.backgroundProperties.playPauseButton,
      type: this.childViewType,
      parentId: this.ui.listItems[0].id
    };
  },

  // Overwrite resortView to only render children as expected
  resortView: function() {
    this._renderChildren();
  },

  ui: {
    listItems: 'listItems'
  },

  behaviors: {
    CollectionViewMultiSelect: {
      behaviorClass: CollectionViewMultiSelect
    },
    Scrollable: {
      behaviorClass: Scrollable,
      implementsSlidingRender: true
    },
    SlidingRender: {
      behaviorClass: SlidingRender
    },
    Sortable: {
      behaviorClass: Sortable
    },
    Tooltipable: {
      behaviorClass: Tooltipable
    }
  }
});

export default StreamItemsView;