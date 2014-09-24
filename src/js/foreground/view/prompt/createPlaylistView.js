define([
    'common/enum/dataSourceType',
    'common/model/dataSource',
    'text!template/prompt/createPlaylist.html'
], function (DataSourceType, DataSource, CreatePlaylistTemplate) {
    'use strict';

    var Playlists = Streamus.backgroundPage.Playlists;

    var CreatePlaylistView = Backbone.Marionette.ItemView.extend({
        id: 'createPlaylist',
        template: _.template(CreatePlaylistTemplate),
        
        templateHelpers: function () {
            return {
                'requiredMessage': chrome.i18n.getMessage('required'),
                'titleLowerCaseMessage': chrome.i18n.getMessage('title').toLowerCase(),
                'optionalMessage': chrome.i18n.getMessage('optional'),
                'playlistMessage': chrome.i18n.getMessage('playlist'),
                'playlistLowerCaseMessage': chrome.i18n.getMessage('playlist').toLowerCase(),
                'urlMessage': chrome.i18n.getMessage('url'),
                'channelLowerCaseMessage': chrome.i18n.getMessage('channel').toLowerCase(),
                'playlistCount': Playlists.length
            };
        },
        
        ui: {
            'playlistTitleInput': '#createPlaylist-playlistTitleInput',
            'youTubeSourceInput': '#createPlaylist-youTubeSourceInput'
        },

        events: {
            'input @ui.youTubeSourceInput': '_onSourceInput',
            'input @ui.playlistTitleInput': '_validateTitle'
        },

        onRender: function () {
            this._setDataSourceAsUserInput();
        },

        onShow: function () {
            //  Reset the value after focusing to focus without selecting.
            this.ui.playlistTitleInput.focus().val(this.ui.playlistTitleInput.val());
        },
        
        createPlaylist: function() {
            var dataSource = this.ui.youTubeSourceInput.data('datasource');
            var playlistName = this.ui.playlistTitleInput.val().trim();

            Playlists.addPlaylistByDataSource(playlistName, dataSource);
        },
        
        //  Debounce for typing support so I know when typing has finished
        _onSourceInput: _.debounce(function () {
            //  Wrap in a setTimeout to let drop event finish (no real noticeable lag but keeps things DRY easier)
            setTimeout(this._parseInput.bind(this));
        }, 100),
        
        _parseInput: function () {
            var youTubeUrl = this.ui.youTubeSourceInput.val().trim();
            this.ui.youTubeSourceInput.removeData('datasource').removeClass('is-valid is-invalid');

            if (youTubeUrl !== '') {
                this._setDataSourceViaUrl(youTubeUrl);
            } else {
                this._resetInputState();
            }
        },
        
        _validateTitle: function () {
            //  When the user submits - check to see if they provided a playlist name
            var playlistTitle = this.ui.playlistTitleInput.val().trim();
            this.ui.playlistTitleInput.toggleClass('is-invalid', playlistTitle === '');
        },

        _setDataSourceAsUserInput: function() {
            this.ui.youTubeSourceInput.data('datasource', new DataSource({
                type: DataSourceType.UserInput
            }));
        },
        
        _setDataSourceViaUrl: function(url) {
            //  Check validity of URL and represent validity via invalid class.
            var dataSource = new DataSource({
                url: url,
                parseVideo: false
            });

            dataSource.parseUrl({
                success: function () {
                    this._onParseUrlSuccess(dataSource);
                }.bind(this)
            });
        },
        
        _onParseUrlSuccess: function(dataSource) {
            this.ui.youTubeSourceInput.data('datasource', dataSource);

            dataSource.getTitle({
                success: this._onGetTitleSuccess.bind(this),
                error: this._onGetTitleError.bind(this)
            });
        },
        
        _onGetTitleSuccess: function(title) {
            this.ui.playlistTitleInput.val(title);
            this._validateTitle();
            this.ui.youTubeSourceInput.addClass('is-valid');
        },
        
        _onGetTitleError: function() {
            var originalValue = this.ui.playlistTitleInput.val();
            this.ui.playlistTitleInput.data('original-value', originalValue).val(chrome.i18n.getMessage('errorRetrievingTitle'));
            this.ui.youTubeSourceInput.addClass('is-invalid');
        },
        
        _resetInputState: function() {
            this.ui.youTubeSourceInput.removeClass('is-invalid is-valid');
            this.ui.playlistTitleInput.val(this.ui.playlistTitleInput.data('original-value'));
            this._setDataSourceAsUserInput();
        }
    });

    return CreatePlaylistView;
});