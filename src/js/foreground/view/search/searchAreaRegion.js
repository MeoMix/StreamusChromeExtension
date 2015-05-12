define(function(require) {
    'use strict';

    var SearchView = require('foreground/view/search/searchView');

    //  TODO: SearchAreaRegion vs SearchView...
    var SearchAreaRegion = Marionette.Region.extend({
        settings: null,

        initialize: function() {
            this.settings = Streamus.backgroundPage.settings;

            this.listenTo(Streamus.channels.searchArea.commands, 'show:search', this._showSearch);
            this.listenTo(Streamus.channels.searchArea.commands, 'hide:search', this._hideSearch);
            this.listenTo(Streamus.channels.foregroundArea.vent, 'rendered', this._onForegroundAreaRendered);
            this.listenTo(Streamus.channels.foregroundArea.vent, 'idle', this._onForegroundAreaIdle);
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
            //  If the search view isn't going to be shown right off the bat then it's OK to defer loading until idle so that 
            //  the initial load time of the application isn't impacted.
            if (!this.settings.get('openToSearch')) {
                this._createSearchView();
            }
        },

        _createSearchView: function() {
            if (!this._searchViewExists()) {
                var searchView = new SearchView({
                    model: Streamus.backgroundPage.search,
                    collection: Streamus.backgroundPage.search.get('results'),
                    streamItems: Streamus.backgroundPage.stream.get('items'),
                    signInManager: Streamus.backgroundPage.signInManager
                });

                this.show(searchView);
                this.listenTo(searchView, 'hide:search', this._hideSearch);
            }
        },

        _showSearch: function(options) {
            //  It's technially possible for the user to request search to be shown before the view has been created.
            //  If the Application hasn't entered 'idle' state yet and the user moves fast then they can get here.
            if (!this._searchViewExists()) {
                this._createSearchView();
            }

            Streamus.channels.searchArea.vent.trigger('showing');

            //  If the view should be visible when UI first loads then do not transition.
            if (options && options.instant) {
                this.$el.addClass('is-instant');
            }

            this.$el.addClass('is-visible');
            this.currentView.triggerMethod('visible');
        },

        _hideSearch: function() {
            Streamus.channels.searchArea.vent.trigger('hiding');
            this.$el.removeClass('is-instant is-visible');
        },

        //  Returns true if SearchView is currently shown in the region
        _searchViewExists: function() {
            return !_.isUndefined(this.currentView);
        }
    });

    return SearchAreaRegion;
});