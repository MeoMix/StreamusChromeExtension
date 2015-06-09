define(function(require) {
  'use strict';

  // TODO: It's weird that I am pulling in views from other folders.
  var ActivePaneTemplate = require('text!template/activePane/activePane.html');
  var StreamView = require('foreground/view/stream/streamView');
  var ActivePlaylistAreaView = require('foreground/view/leftPane/activePlaylistAreaView');
  // TODO: Potentially show a 'sign in' view?
  var ActivePaneView = Marionette.LayoutView.extend({
    className: 'flexColumn',
    template: _.template(ActivePaneTemplate),

    regions: {
      stream: '[data-region=stream]',
      activePlaylistArea: '[data-region=activePlaylistArea]'
    },

    ui: {
      streamRegion: '[data-ui~=streamRegion]',
      activePlaylistAreaRegion: '[data-ui~=activePlaylistAreaRegion]'
    },

    activePlaylistManager: null,
    activePlaylistManagerEvents: {
      'change:activePlaylist': '_onChangeActivePlaylist'
    },

    initialize: function(options) {
      this.activePlaylistManager = options.activePlaylistManager;
      this.bindEntityEvents(this.activePlaylistManager, this.activePlaylistManagerEvents);
    },

    onRender: function() {
      this._setState(this.activePlaylistManager.get('activePlaylist'));
    },

    _onChangeActivePlaylist: function(model, activePlaylist) {
      this._setState(activePlaylist);
    },

    _setState: function(activePlaylist) {
      if (_.isNull(activePlaylist)) {
        this._hideActivePlaylistAreaView();
        this._showStreamView();
      } else {
        this._hideStreamView();
        this._showActivePlaylistAreaView(activePlaylist);
      }
    },

    _showStreamView: function() {
      this.ui.streamRegion.removeClass('is-hidden');

      this.showChildView('stream', new StreamView({
        model: StreamusFG.backgroundProperties.stream
      }));
    },

    _hideStreamView: function() {
      this.ui.streamRegion.addClass('is-hidden');
      this.getRegion('stream').empty();
    },

    _showActivePlaylistAreaView: function(activePlaylist) {
      this.ui.activePlaylistAreaRegion.removeClass('is-hidden');

      this.showChildView('activePlaylistArea', new ActivePlaylistAreaView({
        model: activePlaylist,
        collection: activePlaylist.get('items'),
        streamItems: StreamusFG.backgroundProperties.stream.get('items')
      }));
    },

    _hideActivePlaylistAreaView: function() {
      this.ui.activePlaylistAreaRegion.addClass('is-hidden');
      this.getRegion('activePlaylistArea').empty();
    }
  });

  return ActivePaneView;
});