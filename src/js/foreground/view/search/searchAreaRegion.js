define([
    'foreground/view/search/searchView'
], function (SearchView) {
    'use strict';
    
    var Search = Streamus.backgroundPage.Search;
    var Settings = Streamus.backgroundPage.Settings;

    var SearchAreaRegion = Backbone.Marionette.Region.extend({
        el: '#foregroundArea-searchAreaRegion',
        
        initialize: function () {
            this.listenTo(Backbone.Wreqr.radio.channel('global').vent, 'showSearch', this.showSearchView);
            this.listenTo(Backbone.Wreqr.radio.channel('foregroundArea').vent, 'shown', this._onForegroundAreaShown);
        },

        showSearchView: function (doSnapAnimation) {
            this._searchViewExists() ? this._focusSearchView() : this._createSearchView(doSnapAnimation);
        },
        
        _onForegroundAreaShown: function () {
            if (Settings.get('alwaysOpenToSearch')) {
                this.showSearchView(false);
            }
        },
        
        //  Returns true if SearchView is currently shown
        _searchViewExists: function () {
            return !_.isUndefined(this.currentView) && this.currentView instanceof SearchView;
        },
        
        //  Focus the SearchView to bring attention to it -- the user might not have realized it is already open.
        _focusSearchView: function () {
            this.currentView.focusInput();
        },
        
        _createSearchView: function (doSnapAnimation) {
            var searchView = new SearchView({
                collection: Search.get('results'),
                model: Search,
                //  Indicate whether view should appear immediately or animate.
                doSnapAnimation: doSnapAnimation
            });

            this.show(searchView);
        }
    });

    return SearchAreaRegion;
});