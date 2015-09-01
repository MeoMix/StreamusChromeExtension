'use strict';
import {Region} from 'marionette';
import SearchView from 'foreground/view/search/searchView';
import LayoutType from 'common/enum/layoutType';

var SearchRegion = Marionette.Region.extend({
  settings: null,

  initialize: function(options) {
    this.settings = options.settings;

    this.listenTo(StreamusFG.channels.search.commands, 'show:search', this._showSearch);
    this.listenTo(StreamusFG.channels.search.commands, 'hide:search', this._hideSearch);
    this.listenTo(StreamusFG.channels.foregroundArea.vent, 'rendered', this._onForegroundAreaRendered);
    this.listenTo(StreamusFG.channels.foregroundArea.vent, 'idle', this._onForegroundAreaIdle);
    this.listenTo(this.settings, 'change:layoutType', this._onSettingsChangeLayoutType);
  },

  _onForegroundAreaRendered: function() {
    this._setWidth(this.settings.get('layoutType'));
    var search = StreamusFG.backgroundProperties.search;

    if (search.hasQuery()) {
      this._createSearchView();

      this._showSearch({
        instant: true
      });
    }
  },

  _onForegroundAreaIdle: function() {
    // If the search view isn't going to be shown right off the bat then it's OK to defer loading until idle so that
    // the initial load time of the application isn't impacted.
    var search = StreamusFG.backgroundProperties.search;
    if (!search.hasQuery()) {
      this._createSearchView();
    }
  },

  _onSettingsChangeLayoutType: function(settings, layoutType) {
    this._setWidth(layoutType);
  },

  _createSearchView: function() {
    if (!this.hasView()) {
      var searchView = new SearchView({
        model: StreamusFG.backgroundProperties.search,
        collection: StreamusFG.backgroundProperties.search.get('results'),
        streamItems: StreamusFG.backgroundProperties.stream.get('items'),
        signInManager: StreamusFG.backgroundProperties.signInManager
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

    // If the view should be visible when UI first loads then do not transition.
    if (options && options.instant) {
      this.$el.addClass('is-instant');
    }

    this.$el.addClass('is-visible');
    this.currentView.triggerMethod('visible');
  },

  _hideSearch: function() {
    this.$el.removeClass('is-instant is-visible');
  },

  _setWidth: function(layoutType) {
    // TODO: How can I safely get the reference to this region's element?
    var element = this.$el.length > 0 ? this.$el : $(this.el);

    element.toggleClass('is-fullWidth', layoutType === LayoutType.FullPane);
    element.toggleClass('is-halfWidth', layoutType === LayoutType.SplitPane);
  }
});

export default SearchRegion;