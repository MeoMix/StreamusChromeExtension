define([
    'foreground/view/leftCoveringPane/playlistsAreaView',
    'foreground/view/leftCoveringPane/searchView'
], function (PlaylistsAreaView, SearchView) {
    'use strict';
    
    var Search = Streamus.backgroundPage.Search;
    var Settings = Streamus.backgroundPage.Settings;
    var Playlists = Streamus.backgroundPage.Playlists;

    var LeftCoveringPaneRegion = Backbone.Marionette.Region.extend({
        //  TODO: I am required to use ID selector here until bug resolved: https://github.com/marionettejs/backbone.marionette/issues/1530
        el: '#left-covering-pane-region',
        
        initialize: function () {
            this.listenTo(Backbone.Wreqr.radio.channel('global').vent, 'showSearch', this._showSearchView);
            this.listenTo(Backbone.Wreqr.radio.channel('global').vent, 'showPlaylistsArea', this._showPlaylistsAreaView);
            
            if (Settings.get('alwaysOpenToSearch')) {
                this._showSearchView(false);
            }
        },

        _showSearchView: function (doSnapAnimation) {
            this._searchViewExists() ? this._shakeSearchView() : this._createSearchView(doSnapAnimation);
        },
        
        _showPlaylistsAreaView: function () {
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
            var searchView = new SearchView({
                collection: Search.get('results'),
                model: Search,
                //  Indicate whether view should appear immediately or animate.
                doSnapAnimation: doSnapAnimation
            });

            this.show(searchView);
        },
        
        //  Returns true if PlaylistsAreaView is currently shown
        _playlistsAreaViewExists: function () {
            return !_.isUndefined(this.currentView) && this.currentView instanceof PlaylistsAreaView;
        },
        
        _createPlaylistsAreaView: function() {
            var playlistsAreaView = new PlaylistsAreaView({
                collection: Playlists
            });
            
            this.show(playlistsAreaView);
        }
    });

    return LeftCoveringPaneRegion;
});