define(function (require) {
    'use strict';

    var SearchView = require('foreground/view/search/searchView');

    //  TODO: SearchAreaRegion vs SearchView...
    var SearchAreaRegion = Marionette.Region.extend({
        settings: null,
        
        initialize: function () {
            this.settings = Streamus.backgroundPage.settings;

            this.listenTo(Streamus.channels.searchArea.commands, 'show:search', this._showSearch);
            this.listenTo(Streamus.channels.searchArea.commands, 'hide:search', this._hideSearch);
            this.listenTo(Streamus.channels.foregroundArea.vent, 'shown', this._onForegroundAreaShown);
        },
        
        _onForegroundAreaShown: function () {
            this._createSearchView();

            if (this.settings.get('openToSearch')) {
                this._showSearch({
                    instant: true
                });
            }
        },
        
        _createSearchView: function () {
            var searchView = new SearchView({
                model: Streamus.backgroundPage.search,
                collection: Streamus.backgroundPage.search.get('results')
            });

            this.show(searchView);
            this.listenTo(searchView, 'hide:search', this._hideSearch);
        },

        _showSearch: function (options) {
            Streamus.channels.searchArea.vent.trigger('showing');

            //  If the view should be visible when UI first loads then do not transition.
            if (options && options.instant) {
                this.$el.addClass('is-instant');
            }
            
            this.$el.addClass('is-visible');
            this.currentView.triggerMethod('visible');
        },

        _hideSearch: function () {
            Streamus.channels.searchArea.vent.trigger('hiding');
            this.$el.removeClass('is-instant is-visible');
        }
    });

    return SearchAreaRegion;
});