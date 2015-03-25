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
        },

        _onForegroundAreaRendered: function() {
            if (this.settings.get('openToSearch')) {
                this._createSearchView();

                this._showSearch({
                    instant: true
                });
            } else {
                //  If the search view isn't going to be shown right off the bat then it's OK to defer loading the view for a frame so that 
                //  the initial load time of the application isn't impacted.
                window.requestAnimationFrame(function() {
                    this._createSearchView();
                }.bind(this));
            }
        },

        _createSearchView: function() {
            var searchView = new SearchView({
                model: Streamus.backgroundPage.search,
                collection: Streamus.backgroundPage.search.get('results')
            });

            this.show(searchView);
            this.listenTo(searchView, 'hide:search', this._hideSearch);
        },

        _showSearch: function(options) {
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
        }
    });

    return SearchAreaRegion;
});