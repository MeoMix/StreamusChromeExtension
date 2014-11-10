define([
    'foreground/view/search/searchView'
], function (SearchView) {
    'use strict';
    //  TODO: SearchAreaRegion vs SearchView...
    var SearchAreaRegion = Backbone.Marionette.Region.extend({
        el: '#foregroundArea-searchAreaRegion',
        settings: null,
        
        initialize: function () {
            this.settings = Streamus.backgroundPage.settings;

            this.listenTo(Streamus.channels.searchArea.commands, 'show:search', this._showSearch);
            this.listenTo(Streamus.channels.foregroundArea.vent, 'shown', this._onForegroundAreaShown);
        },
        
        _onForegroundAreaShown: function () {
            this._createSearchView();

            if (this.settings.get('alwaysOpenToSearch')) {
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
            //  If the view should be visible when UI first loads then do not transition.
            if (options && options.instant) {
                this.$el.addClass('is-instant');
            }
            
            this.$el.addClass('is-visible');
            this.currentView.triggerMethod('visible');
        },

        _hideSearch: function () {
            this.$el.removeClass('is-instant is-visible');
        }
    });

    return SearchAreaRegion;
});