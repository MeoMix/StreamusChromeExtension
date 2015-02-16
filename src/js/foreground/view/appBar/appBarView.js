define(function (require) {
    'use strict';

    var AdminMenuArea = require('foreground/model/adminMenuArea');
    var AdminMenuAreaView = require('foreground/view/appBar/adminMenuAreaView');
    var NextButtonView = require('foreground/view/appBar/nextButtonView');
    var PlaylistTitleView = require('foreground/view/appBar/playlistTitleView');
    var PlayPauseButtonView = require('foreground/view/appBar/playPauseButtonView');
    var PreviousButtonView = require('foreground/view/appBar/previousButtonView');
    var VolumeAreaView = require('foreground/view/appBar/volumeAreaView');
    var Tooltip = require('foreground/view/behavior/tooltip');
    var AppBarTemplate = require('text!template/appBar/appBar.html');
    var MenuIconTemplate = require('text!template/icon/menuIcon_24.svg');
    var SearchIconTemplate = require('text!template/icon/searchIcon_24.svg');
    var CloseIconTemplate = require('text!template/icon/closeIcon_24.svg');

    var AppBarView = Marionette.LayoutView.extend({
        id: 'appBar',
        template: _.template(AppBarTemplate),
        
        templateHelpers: function () {
            return {
                searchQuery: this.search.get('query'),
                showSearchMessage: chrome.i18n.getMessage('showSearch'),
                searchMessage: chrome.i18n.getMessage('search'),
                menuIcon: _.template(MenuIconTemplate)(),
                searchIcon: _.template(SearchIconTemplate)(),
                closeIcon: _.template(CloseIconTemplate)()
            };
        },
        
        regions: function () {
            return {
                //  TODO: Maybe move into its own region because it's getting complicated to tell whether user is signed in or not to load playlist title.
                playlistTitleRegion: '#' + this.id + '-playlistTitleRegion',
                volumeAreaRegion: '#' + this.id + '-volumeAreaRegion',
                adminMenuAreaRegion: '#' + this.id + '-adminMenuAreaRegion',
                previousButtonRegion: '#' + this.id + '-previousButtonRegion',
                playPauseButtonRegion: '#' + this.id + '-playPauseButtonRegion',
                nextButtonRegion: '#' + this.id + '-nextButtonRegion'
            };
        },
        
        ui: function () {
            return {
                searchInput: '#' + this.id + '-searchInput',
                showSearchButton: '#' + this.id + '-showSearchButton',
                hideSearchButton: '#' + this.id + '-hideSearchButton',
                showPlaylistsAreaButton: '#' + this.id + '-showPlaylistsAreaButton',
                hidePlaylistsAreaButton: '#' + this.id + '-hidePlaylistsAreaButton',
                //  TODO: I don't like regions being manipulated in UI they should be stateless.
                //  To achieve this, I'll need to make playlistTitleRegion and searchInputRegion the same region and swap views out.
                playlistTitleRegion: '#' + this.id + '-playlistTitleRegion',
                searchInputRegion: '#' + this.id + '-searchInputRegion'
            };
        },
        
        events: {
            'click @ui.showSearchButton': '_onClickShowSearchButton',
            'click @ui.hideSearchButton': '_onClickHideSearchButton',
            'input @ui.searchInput': '_onInputSearchInput',
            //  TODO: prefer to read from ViewModel state rather than rely on HTML state.
            'click @ui.showPlaylistsAreaButton:not(.is-disabled)': '_onClickShowPlaylistsAreaButton',
            'click @ui.hidePlaylistsAreaButton': '_onClickHidePlaylistsAreaButton'
        },
        
        behaviors: {
            //  Needed for the 'not signed in' message on nav button.
            Tooltip: {
                behaviorClass: Tooltip
            }
        },

        signInManager: null,
        search: null,

        initialize: function () {
            this.signInManager = Streamus.backgroundPage.signInManager;
            this.search = Streamus.backgroundPage.search;

            this.listenTo(this.signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);
            this.listenTo(this.search, 'change:query', this._onSearchChangeQuery);

            this.listenTo(Streamus.channels.playlistsArea.vent, 'hiding', this._onPlaylistsAreaHiding);
            this.listenTo(Streamus.channels.playlistsArea.vent, 'showing', this._onPlaylistsAreaShowing);
            this.listenTo(Streamus.channels.searchArea.vent, 'hiding', this._onSearchAreaHiding);
            this.listenTo(Streamus.channels.searchArea.vent, 'showing', this._onSearchAreaShowing);

            var signedInUser = this.signInManager.get('signedInUser');
            if (signedInUser !== null) {
                this.listenTo(signedInUser.get('playlists'), 'change:active', this._onPlaylistsChangeActive);
            }
        },
        
        onRender: function () {
            var signedInUser = this.signInManager.get('signedInUser');
            this._setShowPlaylistsAreaButtonState(signedInUser);

            if (signedInUser !== null) {
                this._setPlaylistTitleRegion(signedInUser);
            }

            this.volumeAreaRegion.show(new VolumeAreaView());

            this.adminMenuAreaRegion.show(new AdminMenuAreaView({
                model: new AdminMenuArea()
            }));

            this.previousButtonRegion.show(new PreviousButtonView({
                model: Streamus.backgroundPage.previousButton
            }));

            this.playPauseButtonRegion.show(new PlayPauseButtonView({
                model: Streamus.backgroundPage.playPauseButton
            }));

            this.nextButtonRegion.show(new NextButtonView({
                model: Streamus.backgroundPage.nextButton
            }));
        },
        
        onAttach: function () {
            //  TODO: It would be better to read this state from a viewmodel rather than hitting the DOM.
            //  Needs to be ran in onAttach as well as when the search is showing because 'showing' event can trigger when view is rendering rather than attached.
            if (this.ui.searchInput.is(':visible')) {
                this._focusSearchInput();
            }
        },
        
        _onSearchChangeQuery: function (model, query) {
            var searchInputElement = this.ui.searchInput[0];
            var selectionStart = searchInputElement.selectionStart;
            var selectionEnd = searchInputElement.selectionEnd;
            this.ui.searchInput.val(query);
            
            //  Preserve the selection range which is lost after modifying val
            searchInputElement.setSelectionRange(selectionStart, selectionEnd);
        },
        
        _onSignInManagerChangeSignedInUser: function (model, signedInUser) {
            if (signedInUser === null) {
                this.stopListening(model.previous('signedInUser').get('playlists'));
                this.playlistTitleRegion.empty();
            } else {
                this._setPlaylistTitleRegion(signedInUser);
                this.listenTo(signedInUser.get('playlists'), 'change:active', this._onPlaylistsChangeActive);
            }

            this._setShowPlaylistsAreaButtonState(signedInUser);
        },
        
        _onPlaylistsChangeActive: function (model, active) {
            if (active) {
                this.playlistTitleRegion.show(new PlaylistTitleView({
                    model: model
                }));
            }
        },
        
        _onClickShowSearchButton: function () {
            Streamus.channels.searchArea.commands.trigger('show:search');
            Streamus.channels.playlistsArea.commands.trigger('hide:playlistsArea');
        },
        
        _onClickHideSearchButton: function () {
            Streamus.channels.searchArea.commands.trigger('hide:search');
        },
        
        _onInputSearchInput: function() {
            Streamus.channels.searchArea.commands.trigger('search', {
                query: this.ui.searchInput.val()
            });
        },

        _onClickShowPlaylistsAreaButton: function () {
            Streamus.channels.playlistsArea.commands.trigger('show:playlistsArea');
            Streamus.channels.searchArea.commands.trigger('hide:search');
        },
        
        _onClickHidePlaylistsAreaButton: function () {
            Streamus.channels.playlistsArea.commands.trigger('hide:playlistsArea');
        },
        
        _onPlaylistsAreaShowing: function() {
            this.ui.showPlaylistsAreaButton.addClass('is-hidden');
            this.ui.hidePlaylistsAreaButton.removeClass('is-hidden');
        },
        
        _onPlaylistsAreaHiding: function () {
            this.ui.showPlaylistsAreaButton.removeClass('is-hidden');
            this.ui.hidePlaylistsAreaButton.addClass('is-hidden');
        },
        
        _onSearchAreaShowing: function () {
            this.ui.showSearchButton.addClass('is-hidden');
            this.ui.hideSearchButton.removeClass('is-hidden');
            this.ui.playlistTitleRegion.addClass('is-hidden');
            this.ui.searchInputRegion.removeClass('is-hidden');

            this._focusSearchInput();
        },
        
        _onSearchAreaHiding: function() {
            this.ui.showSearchButton.removeClass('is-hidden');
            this.ui.hideSearchButton.addClass('is-hidden');
            this.ui.playlistTitleRegion.removeClass('is-hidden');
            this.ui.searchInputRegion.addClass('is-hidden');
        },
        
        _setPlaylistTitleRegion: function (signedInUser) {
            this.playlistTitleRegion.show(new PlaylistTitleView({
                model: signedInUser.get('playlists').getActivePlaylist()
            }));
        },

        _setShowPlaylistsAreaButtonState: function (signedInUser) {
            var signedOut = signedInUser === null;
            var title = signedOut ? chrome.i18n.getMessage('notSignedIn') : '';
            this.ui.showPlaylistsAreaButton.toggleClass('is-disabled', signedOut).attr('title', title);
        },
        
        _focusSearchInput: function() {
            //  Reset val after focusing to prevent selecting the text while maintaining focus.
            //  This needs to be ran after makign the region visible because you can't focus an element which isn't visible.
            this.ui.searchInput.focus().val(this.ui.searchInput.val());
        }
    });

    return AppBarView;
});