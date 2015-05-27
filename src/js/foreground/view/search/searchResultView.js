define(function(require) {
  'use strict';

  var ListItemView = require('foreground/view/listItemView');
  var ListItemMultiSelect = require('foreground/view/behavior/itemViewMultiSelect');
  var AddSongButtonView = require('foreground/view/listItemButton/addSongButtonView');
  var PlayPauseSongButtonView = require('foreground/view/listItemButton/playPauseSongButtonView');
  var SaveSongButtonView = require('foreground/view/listItemButton/saveSongButtonView');
  var SongOptionsButtonView = require('foreground/view/listItemButton/songOptionsButtonView');
  var SearchResultTemplate = require('text!template/search/searchResult.html');
  var SongActions = require('foreground/model/song/songActions');

  var SearchResultView = ListItemView.extend({
    className: ListItemView.prototype.className + ' search-result listItem--medium listItem--hasButtons listItem--selectable',
    template: _.template(SearchResultTemplate),

    events: _.extend({}, ListItemView.prototype.events, {
      'dblclick': '_onDblClick'
    }),

    behaviors: _.extend({}, ListItemView.prototype.behaviors, {
      ListItemMultiSelect: {
        behaviorClass: ListItemMultiSelect
      }
    }),

    buttonViewOptions: function() {
      return {
        PlayPauseSongButtonView: {
          viewClass: PlayPauseSongButtonView,
          song: this.model.get('song'),
          streamItems: StreamusFG.backgroundPage.stream.get('items'),
          player: StreamusFG.backgroundPage.player
        },
        AddSongButtonView: {
          viewClass: AddSongButtonView,
          song: this.model.get('song'),
          streamItems: StreamusFG.backgroundPage.stream.get('items')
        },
        SaveSongButtonView: {
          viewClass: SaveSongButtonView,
          song: this.model.get('song'),
          signInManager: StreamusFG.backgroundPage.signInManager
        },
        SongOptionsButtonView: {
          viewClass: SongOptionsButtonView,
          song: this.model.get('song'),
          player: this.player
        }
      };
    },

    streamItems: null,
    player: null,

    initialize: function(options) {
      this.streamItems = options.streamItems;
      this.player = options.player;
    },

    showContextMenu: function(top, left) {
      var songActions = new SongActions();
      var song = this.model.get('song');

      songActions.showContextMenu(song, top, left, this.player);
    },

    _onDblClick: function() {
      this._playInStream();
    },

    _playInStream: function() {
      this.streamItems.addSongs(this.model.get('song'), {
        playOnAdd: true
      });
    }
  });

  return SearchResultView;
});