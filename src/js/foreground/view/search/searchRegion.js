define(function(require) {
  'use strict';

  var SearchView = require('foreground/view/search/searchView');

  var SearchRegion = Marionette.Region.extend({
    settings: null,

    initialize: function(options) {
      this.settings = options.settings;

      this.listenTo(StreamusFG.channels.search.commands, 'show:search', this._showSearch);
      this.listenTo(StreamusFG.channels.search.commands, 'hide:search', this._hideSearch);
      this.listenTo(StreamusFG.channels.foregroundArea.vent, 'rendered', this._onForegroundAreaRendered);
      this.listenTo(StreamusFG.channels.foregroundArea.vent, 'idle', this._onForegroundAreaIdle);
    },

    _onForegroundAreaRendered: function() {
      if (this.settings.get('openToSearch')) {
        this._createSearchView();

        this._showSearch({
          instant: true
        });
      }
    },

    _onForegroundAreaIdle: function() {
      // If the search view isn't going to be shown right off the bat then it's OK to defer loading until idle so that
      // the initial load time of the application isn't impacted.
      if (!this.settings.get('openToSearch')) {
        this._createSearchView();
      }
    },

    _createSearchView: function() {
      if (!this.hasView()) {
        var searchView = new SearchView({
          model: StreamusFG.backgroundPage.search,
          collection: StreamusFG.backgroundPage.search.get('results'),
          streamItems: StreamusFG.backgroundPage.stream.get('items'),
          signInManager: StreamusFG.backgroundPage.signInManager
        });

        this.show(searchView);
        this.listenTo(searchView, 'hide:search', this._hideSearch);
      }
    },

    _showSearch: function(options) {
      // It's technially possible for the user to request search to be shown before the view has been created.
      // If the Application hasn't entered 'idle' state yet and the user moves fast then they can get here.
      if (!this.hasView()) {
        this._createSearchView();
      }

      StreamusFG.channels.search.vent.trigger('showing');

      // If the view should be visible when UI first loads then do not transition.
      if (options && options.instant) {
        this.$el.addClass('is-instant');
      }

      this.$el.addClass('is-visible');
      this.currentView.triggerMethod('visible');
    },

    _hideSearch: function() {
      StreamusFG.channels.search.vent.trigger('hiding');
      this.$el.removeClass('is-instant is-visible');
    }
  });

  return SearchRegion;
});