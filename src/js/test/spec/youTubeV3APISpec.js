define([
    'common/model/youTubeV3API',
    'common/model/dataSource',
    'common/enum/dataSourceType'
], function (YouTubeV3API, DataSource, DataSourceType) {
    'use strict';

    describe('YouTubeV3API', function () {

        xit('Should be able to get related song information', function() {
            var relatedSongInformation = null;

            runs(function() {
                YouTubeV3API.getRelatedSongInformation({
                    songId: 'CxHFnVCZDRo',
                    success: function (response) {
                        relatedSongInformation = response;
                        
                        var songs = _.map(relatedSongInformation.items, function (info) {
                            return {
                                id: info.id.videoId,
                                title: info.snippet.title
                            };
                        });
                    }
                });
            });

            waitsFor(function () {
                return relatedSongInformation !== null;
            }, "RelatedSongInformation should be set", 2000);

        });
        
        //  TODO: Test iterative fetching of data maybe?
        it('Should be able to get YouTube favorites', function() {

            var validResults = null;

            runs(function () {

                var favoritesDataSource = new DataSource({
                    urlToParse: 'https://www.youtube.com/watch?list=FL_Gkp1Oa7e2a8NNaf5-KCpA'
                });

                expect(favoritesDataSource.get('type')).toEqual(DataSourceType.YouTubeFavorites);

                YouTubeV3API.getPlaylistItems({
                    playlistId: favoritesDataSource.get('id'),
                    success: function (response) {
                        validResults = response.validResults;
                    }
                });
            });

            waitsFor(function () {
                return validResults !== null;
            }, "validResults should be set", 2000);

        });

        it('Should be able to get channelUploadsPlaylistId by channel name', function() {
            var channelUploadsPlaylistId = null;

            runs(function () {

                var channelDataSource = new DataSource({
                    urlToParse: 'https://www.youtube.com/user/goodguygarry'
                });

                expect(channelDataSource.get('type')).toEqual(DataSourceType.YouTubeChannel);
                expect(channelDataSource.idIsUsername()).toBe(true);

                YouTubeV3API.getChannelUploadsPlaylistId({
                    username: channelDataSource.get('id'),
                    success: function (response) {
                        channelUploadsPlaylistId = response.uploadsPlaylistId;
                    }
                });
            });

            waitsFor(function () {
                return channelUploadsPlaylistId !== null;
            }, "channelUploadsPlaylistId should be set", 2000);

        });
        
        it('Should be able to get channelUploadsPlaylistId by channel id', function () {
            var channelUploadsPlaylistId = null;

            runs(function () {

                var channelDataSource = new DataSource({
                    urlToParse: 'https://www.youtube.com/channel/UC_Gkp1Oa7e2a8NNaf5-KCpA'
                });

                expect(channelDataSource.get('type')).toEqual(DataSourceType.YouTubeChannel);
                expect(channelDataSource.idIsUsername()).toBe(false);
                
                YouTubeV3API.getChannelUploadsPlaylistId({
                    channelId: channelDataSource.get('id'),
                    success: function (response) {
                        channelUploadsPlaylistId = response.uploadsPlaylistId;
                    }
                });
            });

            waitsFor(function () {
                return channelUploadsPlaylistId !== null;
            }, "channelUploadsPlaylistId should be set", 2000);

        });

        it('Should be able to get a channels latest batch of uploaded videos', function() {
            var validResults = null;
            var channelUploadsPlaylistId = 'UU_Gkp1Oa7e2a8NNaf5-KCpA';
            
            YouTubeV3API.getPlaylistItems({
                playlistId: channelUploadsPlaylistId,
                success: function (response) {
                    validResults = response.validResults;
                }
            });
            
            waitsFor(function () {
                return validResults !== null;
            }, "validResults should be set", 2000);

        });
        
        it('Should be able to getPlaylistItems', function () {
            var validResults = null;

            runs(function () {

                var playlistDataSource = new DataSource({
                    urlToParse: 'https://www.youtube.com/watch?list=PLCyVVJA8G-6CPwZ1Gzj_oYody7x_p5ipR'
                });

                expect(playlistDataSource.get('type')).toEqual(DataSourceType.YouTubePlaylist);

                YouTubeV3API.getPlaylistItems({
                    playlistId: playlistDataSource.get('id'),
                    success: function (response) {
                        validResults = response.validResults;
                    }
                });
            });

            waitsFor(function () {
                return validResults !== null;
            }, "validResults should be set", 2000);

        });

        it('Should be able to get auto-generated playlist data', function () {
            
            var validResults = null;

            runs(function () {

                var autoGeneratedPlaylistDataSource = new DataSource({
                    urlToParse: 'https://www.youtube.com/watch?list=ALYL4kY05133rTMhTulSaXKj_Y6el9q0JH'
                });

                expect(autoGeneratedPlaylistDataSource.get('type')).toEqual(DataSourceType.YouTubeAutoGenerated);

                YouTubeV3API.getPlaylistItems({
                    playlistId: autoGeneratedPlaylistDataSource.get('id'),
                    success: function (response) {
                        validResults = response.validResults;
                    }
                });
            });

            waitsFor(function () {
                return validResults !== null;
            }, "validResults should be set", 2000);
        });

        xit('Should be able to get an auto-generated playlist\'s title', function () {

            var autoGeneratedPlaylistTitle = null;
            runs(function () {
                YouTubeV3API.getAutoGeneratedPlaylistTitle('ALYL4kY05133rTMhTulSaXKj_Y6el9q0JH', function (response) {
                    autoGeneratedPlaylistTitle = response;
                });
            }, 500);

            waitsFor(function () {
                return autoGeneratedPlaylistTitle !== null;
            }, "The autoGeneratedPlaylistTitle should be set", 2000);

            runs(function () {
                expect(autoGeneratedPlaylistTitle).not.toEqual('');
                expect(autoGeneratedPlaylistTitle).toEqual('Top Tracks for Kendrick Lamar');
            });

        });

        xit('Should be able to login to YouTube', function () {
            YouTubeV3API.doYouTubeLogin();
        });

    });

});