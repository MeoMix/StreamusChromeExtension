define([
    'foreground/model/playlistsArea',
    'foreground/model/search',
    'foreground/view/leftCoveringPane/playlistsAreaView',
    'foreground/view/leftCoveringPane/searchView'
], function (PlaylistsArea, Search, PlaylistsAreaView, SearchView) {
    'use strict';
    
    var SearchResults = chrome.extension.getBackgroundPage().SearchResults;
    var Settings = chrome.extension.getBackgroundPage().Settings;
    var Playlists = chrome.extension.getBackgroundPage().Playlists;

    var LeftCoveringPaneRegion = Backbone.Marionette.Region.extend({
        el: '#left-covering-pane-region',
        
        initialize: function () {
            this.listenTo(window.Application.vent, 'showSearch', this.showSearchView);
            this.listenTo(window.Application.vent, 'showPlaylistsArea', this.showPlaylistsAreaView);
            
            if (Settings.get('alwaysOpenToSearch')) {
                this.showSearchView(false);
            }
        },

        showSearchView: function (doSnapAnimation) {
            this._searchViewExists() ? this._shakeSearchView() : this._createSearchView(doSnapAnimation);
        },
        
        showPlaylistsAreaView: function () {
            if (!this._playlistsAreaViewExists()) {
                this._createPlaylistsAreaView();
            }
        },
        
        //  Returns true if SearchView is currently shown
        _searchViewExists: function () {
            return !_.isUndefined(this.currentView) && this.currentView instanceof SearchView;
        },
        
        //  Shake the SearchView to bring attention to it -- the user might not have realized it is already open.
        _shakeSearchView: function() {
            this.currentView.shake();
        },
        
        _createSearchView: function (doSnapAnimation) {
            //  Create model for the view and indicate whether view should appear immediately or display snap animation.
            var search = new Search({
                playlist: Playlists.getActivePlaylist(),
                doSnapAnimation: doSnapAnimation
            });

            this.show(new SearchView({
                collection: SearchResults,
                model: search
            }));

            //  When the user has clicked 'close' button the view will slide out and destroy its model. Cleanup events.
            this.listenToOnce(search, 'destroy', this.empty);
        },
        
        //  Returns true if PlaylistsAreaView is currently shown
        _playlistsAreaViewExists: function () {
            return !_.isUndefined(this.currentView) && this.currentView instanceof PlaylistsAreaView;
        },
        
        _createPlaylistsAreaView: function() {
            var playlistsArea = new PlaylistsArea();
            
            this.show(new PlaylistsAreaView({
                model: playlistsArea,
                collection: Playlists
            }));

            //  When the user has clicked 'close' button the view will slide out and destroy its model. Cleanup events.
            this.listenToOnce(playlistsArea, 'destroy', this.empty);
        }
    });

    return LeftCoveringPaneRegion;
});