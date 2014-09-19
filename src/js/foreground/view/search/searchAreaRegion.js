define([
    'foreground/view/search/searchView'
], function (SearchView) {
    'use strict';
    
    var Search = Streamus.backgroundPage.Search;

    var SearchAreaRegion = Backbone.Marionette.Region.extend({
        el: '#searchAreaRegion',
        
        initialize: function () {
            this.listenTo(Backbone.Wreqr.radio.channel('global').vent, 'showSearch', this.showSearchView);
        },

        showSearchView: function (doSnapAnimation) {
            this._searchViewExists() ? this._focusSearchView() : this._createSearchView(doSnapAnimation);
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