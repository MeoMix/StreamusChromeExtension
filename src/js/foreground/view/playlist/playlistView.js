import _ from 'common/shim/lodash.reference.shim';
import SpinnerView from 'foreground/view/element/spinnerView';
import ListItemView from 'foreground/view/listItemView';
import AddPlaylistButtonView from 'foreground/view/listItemButton/addPlaylistButtonView';
import DeletePlaylistButtonView from 'foreground/view/listItemButton/deletePlaylistButtonView';
import PlayPlaylistButtonView from 'foreground/view/listItemButton/playPlaylistButtonView';
import PlaylistOptionsButtonView from 'foreground/view/listItemButton/playlistOptionsButtonView';
import PlaylistActions from 'foreground/model/playlist/playlistActions';
import PlaylistTemplate from 'template/playlist/playlist.html!text';

var PlaylistView = ListItemView.extend({
  className: ListItemView.prototype.className + ' playlist listItem--small listItem--hasButtons listItem--selectable',
  template: _.template(PlaylistTemplate),

  ui: {
    title: 'title',
    itemCount: 'itemCount'
  },

  events: _.extend({}, ListItemView.prototype.events, {
    'click': '_onClick',
    'dblclick': '_onDblClick'
  }),

  modelEvents: {
    'change:title': '_onChangeTitle',
    'change:dataSourceLoaded': '_onChangeDataSourceLoaded',
    'change:active': '_onChangeActive',
    'change:isExporting': '_onChangeIsExporting',
    'change:id': '_onChangeId'
  },

  buttonViewOptions: function() {
    return {
      PlayPlaylistButtonView: {
        viewClass: PlayPlaylistButtonView,
        playlist: this.model,
        streamItems: StreamusFG.backgroundProperties.stream.get('items')
      },
      AddPlaylistButtonView: {
        viewClass: AddPlaylistButtonView,
        playlist: this.model,
        streamItems: StreamusFG.backgroundProperties.stream.get('items')
      },
      DeletePlaylistButtonView: {
        viewClass: DeletePlaylistButtonView,
        playlist: this.model
      },
      PlaylistOptionsButtonView: {
        viewClass: PlaylistOptionsButtonView,
        playlist: this.model
      }
    };
  },

  playlistItemsEvents: {
    'add:completed': '_onPlaylistItemsAddCompleted',
    'remove': '_onPlaylistItemsRemove',
    'reset': '_onPlaylistItemsReset'
  },

  initialize: function() {
    this.bindEntityEvents(this.model.get('items'), this.playlistItemsEvents);
  },

  onRender: function() {
    this._setShowingSpinnerClass();
    this._setActiveClass(this.model.get('active'));
    this._setItemCount(this.model.get('items').length);
  },

  showContextMenu: function(top, left) {
    var playlistActions = new PlaylistActions();

    playlistActions.showContextMenu(this.model, top, left);
  },

  _onChangeTitle: function(model, title) {
    this.ui.title.text(title).attr('data-tooltip-text', title);
  },

  _onChangeDataSourceLoaded: function() {
    this._setShowingSpinnerClass();
  },

  _onChangeId: function() {
    this._setShowingSpinnerClass();
  },

  _onChangeActive: function(model, active) {
    this._setActiveClass(active);
  },

  _onChangeIsExporting: function() {
    this._setShowingSpinnerClass();
  },

  _setShowingSpinnerClass: function() {
    var loading = this.model.isLoading();
    var saving = this.model.isNew();
    var isExporting = this.model.get('isExporting');
    var isShowingSpinner = loading || saving || isExporting;

    // Prefer lazy-loading the SpinnerView to not take a perf hit if the view isn't loading.
    if (isShowingSpinner && !this.getRegion('spinner').hasView()) {
      this.showChildView('spinner', new SpinnerView({
        className: 'overlay u-marginAuto'
      }));
    }

    this.$el.toggleClass('is-showingSpinner', isShowingSpinner);
  },

  _setActiveClass: function(active) {
    this.$el.toggleClass('is-active', active);
  },

  _onPlaylistItemsAddCompleted: function(collection) {
    this._setItemCount(collection.length);
  },

  _onPlaylistItemsRemove: function(model, collection) {
    this._setItemCount(collection.length);
  },

  _onPlaylistItemsReset: function(collection) {
    this._setItemCount(collection.length);
  },

  _setItemCount: function(itemCount) {
    // Format the number if it is too large.
    if (itemCount >= 1000) {
      itemCount = Math.floor(itemCount / 1000) + 'K';
    }

    this.ui.itemCount.text(itemCount);
  },

  _activate: function() {
    this.model.set('active', true);
  },

  _onClick: function() {
    this._activate();
  },

  _onDblClick: function() {
    this._activate();
  }
});

export default PlaylistView;