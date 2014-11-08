define([
    'common/enum/dataSourceType',
    'text!template/prompt/createPlaylist.html'
], function (DataSourceType, CreatePlaylistTemplate) {
    'use strict';

    var CreatePlaylistView = Backbone.Marionette.ItemView.extend({
        id: 'createPlaylist',
        template: _.template(CreatePlaylistTemplate),
        
        templateHelpers: function () {
            return {
                requiredMessage: chrome.i18n.getMessage('required'),
                titleLowerCaseMessage: chrome.i18n.getMessage('title').toLowerCase(),
                optionalMessage: chrome.i18n.getMessage('optional'),
                playlistMessage: chrome.i18n.getMessage('playlist'),
                playlistLowerCaseMessage: chrome.i18n.getMessage('playlist').toLowerCase(),
                urlMessage: chrome.i18n.getMessage('url'),
                channelLowerCaseMessage: chrome.i18n.getMessage('channel').toLowerCase(),
                playlistCount: this.playlists.length
            };
        },
        
        ui: {
            'playlistTitle': '#createPlaylist-playlistTitle',
            'youTubeSource': '#createPlaylist-youTubeSource'
        },

        events: {
            'input @ui.youTubeSource': '_onInputYouTubeSource',
            'input @ui.playlistTitle': '_onInputPlaylistTitle'
        },
        
        playlists: null,
        dataSourceManager: null,
        
        initialize: function() {
            this.playlists = Streamus.backgroundPage.signInManager.get('signedInUser').get('playlists');
            this.dataSourceManager = Streamus.backgroundPage.dataSourceManager;
        },

        onRender: function () {
            this._setDataSourceAsUserInput();
        },

        onShow: function () {
            //  Reset the value after focusing to focus without selecting.
            this.ui.playlistTitle.focus().val(this.ui.playlistTitle.val());
        },
        
        createPlaylist: function() {
            var dataSource = this.ui.youTubeSource.data('datasource');
            var playlistName = this.ui.playlistTitle.val().trim();

            this.playlists.addPlaylistByDataSource(playlistName, dataSource);
        },
        
        _onInputYouTubeSourceInput: function() {
            this._debounceParseInput();
        },
        
        _onInputPlaylistTitleInput: function () {
            this._validateTitle();
        },
        
        //  Debounce for typing support so I know when typing has finished
        _debounceParseInput: _.debounce(function () {
            //  Wrap in a setTimeout to let drop event finish (no real noticeable lag but keeps things DRY easier)
            setTimeout(this._parseInput.bind(this));
        }, 100),
        
        _parseInput: function () {
            var youTubeUrl = this.ui.youTubeSource.val().trim();
            this.ui.youTubeSource.removeData('datasource').removeClass('is-invalid is-valid');

            if (youTubeUrl !== '') {
                this._setDataSourceViaUrl(youTubeUrl);
            } else {
                this._resetInputState();
            }
        },
        
        _validateTitle: function () {
            //  When the user submits - check to see if they provided a playlist name
            var playlistTitle = this.ui.playlistTitle.val().trim();
            this.ui.playlistTitle.toggleClass('is-invalid', playlistTitle === '');
        },

        _setDataSourceAsUserInput: function () {
            var dataSource = this.dataSourceManager.getDataSource({
                type: DataSourceType.UserInput
            });

            this.ui.youTubeSource.data('datasource', dataSource);
        },
        
        _setDataSourceViaUrl: function(url) {
            //  Check validity of URL and represent validity via invalid class.
            var dataSource = this.dataSourceManager.getDataSource({
                url: url,
                parseVideo: false
            });

            dataSource.parseUrl({
                success: this._onParseUrlSuccess.bind(this, dataSource),
                error: this._setErrorState.bind(this)
            });
        },
        
        _onParseUrlSuccess: function(dataSource) {
            this.ui.youTubeSource.data('datasource', dataSource);

            dataSource.getTitle({
                success: this._onGetTitleSuccess.bind(this),
                error: this._setErrorState.bind(this)
            });
        },
        
        _onGetTitleSuccess: function(title) {
            this.ui.playlistTitle.val(title);
            this._validateTitle();
            this.ui.youTubeSource.addClass('is-valid');
        },
        
        _setErrorState: function() {
            var originalValue = this.ui.playlistTitle.val();
            this.ui.playlistTitle.data('original-value', originalValue).val(chrome.i18n.getMessage('errorRetrievingTitle'));
            this.ui.youTubeSource.addClass('is-invalid');
        },
        
        _resetInputState: function() {
            this.ui.youTubeSource.removeClass('is-invalid is-valid');
            this.ui.playlistTitle.val(this.ui.playlistTitle.data('original-value'));
            this._setDataSourceAsUserInput();
        }
    });

    return CreatePlaylistView;
});