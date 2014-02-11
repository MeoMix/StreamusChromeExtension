define([
    'foreground/model/foregroundViewManager',
    'text!template/createPlaylist.html',
    'foreground/collection/streamItems',
    'foreground/collection/playlists',
    'common/model/dataSource',
    'enum/dataSourceType'
], function (ForegroundViewManager, CreatePlaylistTemplate, StreamItems, Playlists, DataSource, DataSourceType) {
    'use strict';

    var CreatePlaylistView = Backbone.Marionette.ItemView.extend({

        className: 'createPlaylist',

        template: _.template(CreatePlaylistTemplate),
        
        templateHelpers: {
            'chrome.i18n': chrome.i18n,
            'playlistCount': Playlists.length
        },
        
        ui: {
            'playlistTitleInput': 'input.playlistTitle',
            'youTubeSourceInput': 'input.youTubeSource'
        },

        events: {
            'input @ui.youTubeSourceInput': 'processInput',
            'input @ui.playlistTitleInput': 'validateTitle'
        },

        onRender: function () {
            this.ui.youTubeSourceInput.data('datasource', new DataSource({
                type: DataSourceType.None
            }));

            setTimeout(function () {
                //  Reset the value after focusing to focus without selecting.
                this.ui.playlistTitleInput.focus().val(this.ui.playlistTitleInput.val());
            }.bind(this));
        },
        
        initialize: function () {
            ForegroundViewManager.subscribe(this);
        },

        validateTitle: function() {
            //  When the user submits - check to see if they provided a playlist name
            var playlistTitle = $.trim(this.ui.playlistTitleInput.val());
            this.ui.playlistTitleInput.toggleClass('invalid', playlistTitle === '');
        },
        
        //  Debounce for typing support so I know when typing has finished
        processInput: _.debounce(function () {

            //  Wrap in a setTimeout to let drop event finish (no real noticeable lag but keeps things DRY easier)
            setTimeout(function() {

                var youTubeSource = $.trim(this.ui.youTubeSourceInput.val());
                this.ui.youTubeSourceInput.removeData('datasource').removeClass('valid invalid');

                if (youTubeSource !== '') {

                    //  Check validity of URL and represent validity via invalid class.
                    var dataSource = new DataSource({
                        urlToParse: youTubeSource,
                        parseVideo: false
                    });

                    this.ui.youTubeSourceInput.data('datasource', dataSource);

                    dataSource.getTitle({
                        success: function(title) {
                            this.ui.playlistTitleInput.val(title);
                            this.validateTitle();
                            this.ui.youTubeSourceInput.addClass('valid');
                        }.bind(this),
                        error: function () {
                            var originalValue = this.ui.playlistTitleInput.val();
                            console.log("original value:", originalValue);
                            this.ui.playlistTitleInput.data('original-value', originalValue).val(chrome.i18n.getMessage('errorRetrievingTitle'));
                            this.ui.youTubeSourceInput.addClass('invalid');
                        }.bind(this)
                    });

                } else {
                    this.ui.youTubeSourceInput.removeClass('invalid valid');
                    this.ui.playlistTitleInput.val(this.ui.playlistTitleInput.data('original-value'));
                }
                
            }.bind(this));

        }, 100),
        
        validate: function () {
            //  If all submittable fields indicate themselves as valid -- allow submission.
            var valid = this.$el.find('.submittable.invalid').length === 0;
            return valid;
        },

        doOk: function () {

            var dataSource = this.ui.youTubeSourceInput.data('datasource');
            var playlistName = $.trim(this.ui.playlistTitleInput.val());

            console.log("Data source and playlistName:", dataSource, playlistName);

            //  TODO: It's weird that addPlaylistByDataSource doesn't work with some of the dataSource types.
            if (dataSource.get('type') === DataSourceType.None || dataSource.get('type') === DataSourceType.Unknown) {
                if (!this.model || this.model.length === 0) {
                    Playlists.addEmptyPlaylist(playlistName);
                } else {
                    Playlists.addPlaylistWithVideos(playlistName, this.model);
                }
            } else {
                Playlists.addPlaylistByDataSource(playlistName, dataSource);
            }
            
        }

    });

    return CreatePlaylistView;
});