define([
    'foreground/view/genericForegroundView',
    'text!template/createPlaylist.html',
    'foreground/collection/streamItems',
    'foreground/collection/playlists',
    'common/model/dataSource',
    'enum/dataSourceType'
], function (GenericForegroundView, CreatePlaylistTemplate, StreamItems, Playlists, DataSource, DataSourceType) {
    'use strict';

    var CreatePlaylistView = GenericForegroundView.extend({

        className: 'createPlaylist',

        template: _.template(CreatePlaylistTemplate),

        playlistTitleInput: null,
        youTubeSourceInput: null,

        events: {
            'input input.youTubeSource': 'processInput',
            'input input.playlistTitle': 'validateTitle'
        },

        render: function () {
            
            this.$el.html(this.template({
                'chrome.i18n': chrome.i18n,
                'playlistCount': Playlists.length
            }));

            this.playlistTitleInput = this.$el.find('input.playlistTitle');
            this.youTubeSourceInput = this.$el.find('input.youTubeSource');
            
            this.youTubeSourceInput.data('datasource', new DataSource({
                type: DataSourceType.None
            }));

            setTimeout(function () {
                //  Reset the value after focusing to focus without selecting.
                this.playlistTitleInput.focus().val(this.playlistTitleInput.val());
            }.bind(this));

            return this;
        },

        validateTitle: function() {
            //  When the user submits - check to see if they provided a playlist name
            var playlistTitle = $.trim(this.playlistTitleInput.val());
            this.playlistTitleInput.toggleClass('invalid', playlistTitle === '');
        },
        
        //  Debounce for typing support so I know when typing has finished
        processInput: _.debounce(function () {
            var self = this;
            
            //  Wrap in a setTimeout to let drop event finish (no real noticeable lag but keeps things DRY easier)
            setTimeout(function() {

                var youTubeSource = $.trim(self.youTubeSourceInput.val());
                self.youTubeSourceInput.removeData('datasource').removeClass('valid invalid');

                if (youTubeSource !== '') {

                    //  Check validity of URL and represent validity via invalid class.
                    var dataSource = new DataSource({
                        urlToParse: youTubeSource,
                        parseVideo: false
                    });

                    self.youTubeSourceInput.data('datasource', dataSource);

                    dataSource.getTitle({
                        success: function(title) {
                            self.playlistTitleInput.val(title);
                            self.validateTitle();
                            self.youTubeSourceInput.addClass('valid');
                        },
                        error: function () {
                            var originalValue = self.playlistTitleInput.val();
                            console.log("original value:", originalValue);
                            self.playlistTitleInput.data('original-value', originalValue).val(chrome.i18n.getMessage('errorRetrievingTitle'));
                            self.youTubeSourceInput.addClass('invalid');
                        }
                    });

                } else {
                    self.youTubeSourceInput.removeClass('invalid valid');
                    self.playlistTitleInput.val(self.playlistTitleInput.data('original-value'));
                }
                
            });

        }, 100),
        
        validate: function () {

            //  If all submittable fields indicate themselves as valid -- allow submission.
            var valid = this.$el.find('.submittable.invalid').length === 0;

            return valid;
        },

        doOk: function () {

            var dataSource= this.youTubeSourceInput.data('datasource');
            var playlistName = $.trim(this.playlistTitleInput.val());

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