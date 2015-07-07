define(function(require) {
  'use strict';

  var FixedPosition = require('foreground/enum/fixedPosition');
  var ViewModelContainer = require('foreground/view/behavior/viewModelContainer');
  var LayoutType = require('common/enum/layoutType');
  var ActivePaneFilterTemplate = require('text!template/appBar/activePaneFilter.html');

  // A view which shows the title of the currently active pane and provides a drop-down menu for selecting another
  // pane to activate.
  var ActivePaneFilterView = Marionette.LayoutView.extend({
    className: 'activePaneFilter contentBar-title',
    template: _.template(ActivePaneFilterTemplate),

    behaviors: {
      ViewModelContainer: {
        behaviorClass: ViewModelContainer,
        viewModelNames: ['model']
      }
    },

    ui: {
      'title': '[data-ui~=title]',
      'filterIcon': '[data-ui~=filterIcon]'
    },

    events: {
      'click': '_onClick'
    },

    modelEvents: {
      'change:title': '_onChangeTitle',
      'change:isEnabled': '_onChangeIsEnabled'
    },

    settings: null,

    initialize: function(options) {
      this.settings = options.settings;
    },

    // TODO: Review setState here, not sure if always relevant.
    onRender: function() {
      this._setState(this.model.get('isEnabled'));
    },

    _onClick: function() {
      var isEnabled = this.model.get('isEnabled');

      if (isEnabled) {
        this._showPaneFilterMenu();
      }
    },

    // Show a simple menu containing all playlists as well as the 'now playing' item.
    _showPaneFilterMenu: function() {
      var offset = this.$el.offset();
      var playlists = this.model.get('signInManager').get('signedInUser').get('playlists');

      var simpleMenuItems = playlists.map(function(playlist) {
        return {
          active: playlist.get('active'),
          text: playlist.get('title'),
          value: playlist.get('id'),
          onClick: this._onClickSimpleMenuItem.bind(this)
        };
      }, this);

      var activePlaylist = this.model.get('activePlaylistManager').get('activePlaylist');

      var fixedMenuItem = null;
      var layoutType = this.settings.get('layoutType');

      if (layoutType === LayoutType.FullPane) {
        fixedMenuItem = {
          active: _.isNull(activePlaylist),
          text: chrome.i18n.getMessage('stream'),
          fixedPosition: FixedPosition.Top,
          onClick: this._onClickFixedMenuItem.bind(this)
        };
      }

      StreamusFG.channels.simpleMenu.commands.trigger('show:simpleMenu', {
        top: offset.top,
        left: offset.left,
        simpleMenuItems: simpleMenuItems,
        fixedMenuItem: fixedMenuItem
      });
    },

    _onChangeTitle: function(model, title) {
      this._setTitle(title);
    },

    _onChangeIsEnabled: function(model, isEnabled) {
      this._setState(isEnabled);
    },

    // Activate the playlist corresponding to the given item's id. This will cause the corresponding
    // view to be shown.
    _onClickSimpleMenuItem: function(model) {
      var playlistId = model.get('value');
      this._setPlaylistActive(playlistId);
    },

    // When the fixed menu item is clicked - deactivate the active playlist so that the 'now playing' stream
    // will be shown.
    _onClickFixedMenuItem: function() {
      this._deactivateActivePlaylist();
    },

    _setTitle: function(title) {
      this.ui.title.text(title);
    },

    _setPlaylistActive: function(playlistId) {
      var playlists = this.model.get('signInManager').get('signedInUser').get('playlists');
      playlists.get(playlistId).set('active', true);
    },

    _deactivateActivePlaylist: function() {
      var activePlaylist = this.model.get('activePlaylistManager').get('activePlaylist');
      if (!_.isNull(activePlaylist)) {
        activePlaylist.set('active', false);
      }
    },

    // Set the 'enabled' state of view based on its model.
    _setState: function(isEnabled) {
      this.$el.toggleClass('is-enabled', isEnabled);
      this.ui.filterIcon.toggleClass('is-hidden', !isEnabled);
    }
  });

  return ActivePaneFilterView;
});