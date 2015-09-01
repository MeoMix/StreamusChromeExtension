'use strict';
import {Region} from 'marionette';
import SelectionBar from 'foreground/model/selectionBar/selectionBar';
import SelectionBarView from 'foreground/view/selectionBar/selectionBarView';

var SelectionBarRegion = Region.extend({
  initialize: function() {
    this.listenTo(StreamusFG.channels.foregroundArea.vent, 'idle', this._onForegroundAreaIdle);
  },

  _onForegroundAreaIdle: function() {
    var selectionBar = new SelectionBar({
      streamItems: StreamusFG.backgroundProperties.stream.get('items'),
      searchResults: StreamusFG.backgroundProperties.search.get('results'),
      signInManager: StreamusFG.backgroundProperties.signInManager,
      activePlaylistManager: StreamusFG.backgroundProperties.activePlaylistManager
    });

    this.show(new SelectionBarView({
      model: selectionBar
    }));

    this._setIsVisible(selectionBar.has('activeCollection'));
    this.listenTo(selectionBar, 'change:activeCollection', this._onSelectionBarChangeActiveCollection);
  },

  _onSelectionBarChangeActiveCollection: function(model, activeCollection) {
    this._setIsVisible(!_.isNull(activeCollection));
  },

  _setIsVisible: function(isVisible) {
    this.$el.toggleClass('is-visible', isVisible);
  }
});

export default SelectionBarRegion;