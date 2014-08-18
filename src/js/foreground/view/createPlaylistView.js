define([
    'common/enum/dataSourceType',
    'common/model/dataSource',
    'text!template/createPlaylist.html'
], function (DataSourceType, DataSource, CreatePlaylistTemplate) {
    'use strict';

    var Playlists = Streamus.backgroundPage.Playlists;

    var CreatePlaylistView = Backbone.Marionette.ItemView.extend({
        className: 'create-playlist',
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
            'playlistTitleInput': 'input.playlist-title',
            'youTubeSourceInput': 'input.youtube-source'
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

        validate: function () {
            //  If all submittable fields indicate themselves as valid -- allow submission.
            var valid = this.$el.find('.submittable.invalid').length === 0;
            return valid;
        },
        
        //  Debounce for typing support so I know when typing has finished
        _onSourceInput: _.debounce(function () {
            //  Wrap in a setTimeout to let drop event finish (no real noticeable lag but keeps things DRY easier)
            setTimeout(this._parseInput.bind(this));
        }, 100),
        
        _parseInput: function () {
            var youTubeUrl = $.trim(this.ui.youTubeSourceInput.val());
            this.ui.youTubeSourceInput.removeData('datasource').removeClass('valid invalid');

            if (youTubeUrl !== '') {
                this._setDataSourceViaUrl(youTubeUrl);
            } else {
                this._resetInputState();
            }
        },
        
        _validateTitle: function () {
            //  When the user submits - check to see if they provided a playlist name
            var playlistTitle = $.trim(this.ui.playlistTitleInput.val());
            this.ui.playlistTitleInput.toggleClass('invalid', playlistTitle === '');
        },

        _setDataSourceAsUserInput: function() {
            this.ui.youTubeSourceInput.data('datasource', new DataSource({
                type: DataSourceType.UserInput
            }));
        },

        _doRenderedOk: function () {
            var dataSource = this.ui.youTubeSourceInput.data('datasource');
            var playlistName = $.trim(this.ui.playlistTitleInput.val());

            Playlists.addPlaylistByDataSource(playlistName, dataSource);
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
            this.ui.youTubeSourceInput.addClass('valid');
        },
        
        _onGetTitleError: function() {
            var originalValue = this.ui.playlistTitleInput.val();
            this.ui.playlistTitleInput.data('original-value', originalValue).val(chrome.i18n.getMessage('errorRetrievingTitle'));
            this.ui.youTubeSourceInput.addClass('invalid');
        },
        
        _resetInputState: function() {
            this.ui.youTubeSourceInput.removeClass('invalid valid');
            this.ui.playlistTitleInput.val(this.ui.playlistTitleInput.data('original-value'));
            this._setDataSourceAsUserInput();
        }
    });

    return CreatePlaylistView;
});