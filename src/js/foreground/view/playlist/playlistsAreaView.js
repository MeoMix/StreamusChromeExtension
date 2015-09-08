import _ from 'common/shim/lodash.reference.shim';
import {LayoutView} from 'marionette';
import PlaylistsView from 'foreground/view/playlist/playlistsView';
import CreatePlaylistDialogView from 'foreground/view/dialog/createPlaylistDialogView';
import PlaylistsAreaTemplate from 'template/playlist/playlistsArea.html!text';

var PlaylistsAreaView = LayoutView.extend({
  id: 'playlistsArea',
  className: 'flexColumn',
  template: _.template(PlaylistsAreaTemplate),
  templateHelpers: {
    createPlaylist: chrome.i18n.getMessage('createPlaylist')
  },

  regions: {
    playlists: 'playlists'
  },

  ui: {
    transitionable: 'transitionable',
    overlay: 'overlay',
    panel: 'panel',
    createPlaylistButton: 'createPlaylistButton'
  },

  events: {
    'click @ui.overlay': '_onClickOverlay',
    'click @ui.hideButton': '_onClickHideButton',
    'click @ui.createPlaylistButton': '_onClickCreatePlaylistButton'
  },

  childEvents: {
    'click:listItems': '_onClickListItems'
  },

  playlists: null,

  initialize: function(options) {
    this.playlists = options.playlists;
  },

  onRender: function() {
    this.showChildView('playlists', new PlaylistsView({
      collection: this.playlists
    }));
  },

  show: function() {
    StreamusFG.channels.playlistsArea.vent.trigger('showing');
    this.ui.transitionable.addClass('is-visible');
  },

  hide: function() {
    StreamusFG.channels.playlistsArea.vent.trigger('hiding');
    this.ui.transitionable.removeClass('is-visible');
  },

  _onClickHideButton: function() {
    this.hide();
  },

  _onClickOverlay: function() {
    this.hide();
  },

  _onClickCreatePlaylistButton: function() {
    StreamusFG.channels.dialog.commands.trigger('show:dialog', CreatePlaylistDialogView, {
      playlists: this.playlists
    });
  },

  // Whenever a playlist is clicked it will become active and the menu should hide itself.
  _onClickListItems: function() {
    this.hide();
  }
});

export default PlaylistsAreaView;