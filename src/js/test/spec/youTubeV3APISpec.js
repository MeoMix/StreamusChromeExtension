define([
    'common/enum/youTubeServiceType',
    'common/model/youTubeV3API'
], function (YouTubeServiceType, YouTubeV3API) {
    'use strict';
    
    describe('YouTubeV3API', function () {

        describe('when asked to find a playable song by title', function () {
            
            beforeEach(function (done) {
                this.result = null;

                YouTubeV3API.findPlayableByTitle({
                    title: 'Gramatik',
                    success: function (response) {
                        this.result = response;
                        done();
                    }.bind(this)
                });
            });

            it('should return a playable result', function() {
                expect(this.result).not.toBeNull();
            });

        });

        describe('when asked to search for songs', function () {
            
            beforeEach(function (done) {
                this.result = null;

                YouTubeV3API.search({
                    text: 'Gramatik',
                    success: function (response) {
                        this.result = response;
                        done();
                    }.bind(this)
                });
            });

            it('should return 50 songs', function () {
                expect(this.result).not.toEqual(null);
                expect(this.result.missingSongIds).not.toEqual(null);
                expect(this.result.missingSongIds.length).toEqual(0);
                expect(this.result.songInformationList.length).toEqual(50);
            });
            
        });

        describe('when asked to get related song information', function () {
            
            beforeEach(function (done) {
                this.result = null;

                YouTubeV3API.getRelatedSongInformationList({
                    songId: 'CxHFnVCZDRo',
                    success: function (response) {
                        this.result = response;
                        done();
                    }.bind(this)
                });
            });

            it('should return related song information', function () {
                expect(this.result).not.toEqual(null);
            });
            
        });
        
        //  TODO: Test iterative fetching of data maybe?
        describe('when asked to get playlist items from a YouTube favorites playlist', function() {

            beforeEach(function (done) {
                this.result = null;

                YouTubeV3API.getPlaylistSongInformationList({
                    playlistId: 'FL_Gkp1Oa7e2a8NNaf5-KCpA',
                    success: function (response) {
                        this.result = response;
                        done();
                    }.bind(this)
                });
            });

            it('should return a list of playlist items', function () {
                expect(this.result).not.toEqual(null);
                expect(this.result.missingSongIds).not.toEqual(null);
                expect(this.result.songInformationList.length).toBeGreaterThan(0);
            });
            
        });

        describe('when asked to get a channel\'s upload\'s playlist by channel name', function () {
            
            beforeEach(function (done) {
                this.result = null;

                YouTubeV3API.getChannelUploadsPlaylistId({
                    username: 'goodguygarry',
                    success: function (response) {
                        this.result = response;
                        done();
                    }.bind(this)
                });
            });

            it('should return an uploads playlist', function () {
                expect(this.result).not.toEqual(null);
                expect(this.result).not.toEqual('');
            });
            
        });
        
        describe('when asked to get a channel\'s upload\'s playlist id by channel id', function () {
            
            beforeEach(function (done) {
                this.result = null;

                YouTubeV3API.getChannelUploadsPlaylistId({
                    channelId: 'UC_Gkp1Oa7e2a8NNaf5-KCpA',
                    success: function (response) {
                        this.result = response;
                        done();
                    }.bind(this)
                });
            });

            it('should return an uploads playlist id', function () {
                expect(this.result).not.toEqual(null);
                expect(this.result).not.toEqual('');
            });
            
        });

        describe('when asked to get a channel\'s latest uploaded videos by uploads playlist id', function () {
            
            beforeEach(function (done) {
                this.result = null;

                YouTubeV3API.getPlaylistSongInformationList({
                    playlistId: 'UU_Gkp1Oa7e2a8NNaf5-KCpA',
                    success: function (response) {
                        this.result = response;
                        done();
                    }.bind(this)
                });
            });
            
            it('should return a list of playlist items', function () {
                expect(this.result).not.toEqual(null);
                expect(this.result.missingSongIds).not.toEqual(null);
                expect(this.result.songInformationList.length).toBeGreaterThan(0);
            });
            
        });
        
        describe('when asked to get a regular playlist\'s playlist items by id', function () {

            beforeEach(function (done) {
                this.result = null;
                
                YouTubeV3API.getPlaylistSongInformationList({
                    playlistId: 'PLCyVVJA8G-6CPwZ1Gzj_oYody7x_p5ipR',
                    success: function (response) {
                        this.result = response;
                        done();
                    }.bind(this)
                });
            });

            it('should return a list of playlist items', function () {
                expect(this.result).not.toEqual(null);
                expect(this.result.missingSongIds).not.toEqual(null);
                expect(this.result.songInformationList.length).toBeGreaterThan(0);
            });
            
        });

        describe('when asked to get an auto-generated playlist\'s items', function () {
            
            beforeEach(function (done) {
                this.result = null;

                YouTubeV3API.getPlaylistSongInformationList({
                    playlistId: 'ALYL4kY05133rTMhTulSaXKj_Y6el9q0JH',
                    success: function (response) {
                        this.result = response;
                        done();
                    }.bind(this)
                });
            });
            
            it('should return a list of playlist items', function () {
                expect(this.result).not.toEqual(null);
                expect(this.result.missingSongIds).not.toEqual(null);
                expect(this.result.songInformationList.length).toBeGreaterThan(0);
            });

        });

        describe('when asked to get a playlist\'s title', function() {
            beforeEach(function (done) {
                this.result = null;

                YouTubeV3API.getTitle({
                    serviceType: YouTubeServiceType.Playlists,
                    id: 'FL_Gkp1Oa7e2a8NNaf5-KCpA',
                    success: function (response) {
                        console.log("Response:", response);
                        this.result = response;
                        done();
                    }.bind(this)
                });
            });

            it('should return the title of the playlist', function () {
                expect(this.result).toEqual('Favorite videos');
            });

        });
        
        describe('when asked to get a channel\'s title', function () {
            beforeEach(function (done) {
                this.result = null;

                YouTubeV3API.getTitle({
                    serviceType: YouTubeServiceType.Channels,
                    id: 'UC_Gkp1Oa7e2a8NNaf5-KCpA',
                    success: function (response) {
                        this.result = response;
                        done();
                    }.bind(this)
                });
            });

            it('should return the title of the playlist', function () {
                expect(this.result).toEqual('Good Guy Garry');
            });

        });
        
        describe('when asked to get the title of an invalid URL', function () {
            beforeEach(function (done) {
                this.result = null;

                YouTubeV3API.getTitle({
                    serviceType: YouTubeServiceType.Playlists,
                    id: 'Sharthstone/playlists',
                    error: function (error) {
                        this.result = error;
                        done();
                    }.bind(this)
                });
            });

            it('should return an error of \'No title found\'', function () {
                expect(this.result).toEqual('No title found');
            });

        });
        
        describe('when asked to get a playable song\'s information', function () {

            beforeEach(function (done) {
                this.result = null;

                YouTubeV3API.getSongInformation({
                    songId: 'MKS8Jn_3bnA',
                    success: function (response) {
                        this.result = response;
                        done();
                    }.bind(this),
                    error: function (error) {
                        console.error("error:", error);
                    }
                });
            });

            it('should return the title of the playlist', function () {
                expect(this.result).not.toEqual(null);
                expect(this.result.title).toEqual('Danger - 22h39');
            });

        });

        describe('when asked to get information on a song which has been removed for copyright infringement', function() {

            beforeEach(function (done) {
                this.error = null;

                YouTubeV3API.getSongInformation({
                    songId: 'mNGpPqxsTmQ',
                    error: function (error) {
                        this.error = error;
                        done();
                    }.bind(this)
                });
            });
            
            it('should throw an error indicating no song found', function () {
                expect(this.error).not.toEqual(null);
            });

        });
        
        describe('when asked to get information on a song which is unavailable', function () {

            beforeEach(function (done) {
                this.error = null;

                YouTubeV3API.getSongInformation({
                    songId: 'JMPYmNINxrE',
                    error: function (error) {
                        this.error = error;
                        done();
                    }.bind(this)
                });
            });

            it('should throw an error indicating no song found', function () {
                expect(this.error).not.toEqual(null);
            });

        });

        describe('when asked to get a list of information involving only unavailable songs', function () {

            beforeEach(function (done) {
                this.error = null;

                YouTubeV3API.getPlaylistSongInformationList({
                    songId: ['mNGpPqxsTmQ', 'JMPYmNINxrE'],
                    error: function (error) {
                        console.log("Error:", error);
                        this.error = error;
                        done();
                    }.bind(this)
                });
            });

            it('should throw an error indicating no songs found', function () {
                expect(this.error).not.toEqual(null);
            });

        });
        
        describe('when asked to get a list of information involving both available and unavailable songs', function () {

            beforeEach(function (done) {
                this.response = null;

                YouTubeV3API.getSongInformationList({
                    songIds: ['MKS8Jn_3bnA', 'mNGpPqxsTmQ', '6od4WeaWDcs', 'JMPYmNINxrE'],
                    success: function (response) {
                        this.response = response;
                        done();
                    }.bind(this)
                });
            });

            it('should return the available songs', function () {
                expect(this.response).not.toEqual(null);
                expect(this.response.songInformationList.length).toEqual(2);
                expect(this.response.missingSongIds.length).toEqual(2);
            });

        });

        //  TODO: Figure out how to detect. http://stackoverflow.com/questions/22886156/detecting-that-a-youtube-video-was-muted-for-copyright-violations
        xdescribe('when asked to get song information for a copyright-muted song', function () {

            beforeEach(function (done) {
                this.response = null;
                console.log("goin for it");
                YouTubeV3API.getSongInformation({
                    songId: '1poQE-mItpc',
                    success: function (response) {
                        this.response = response;
                        console.log("Response:", response);
                        done();
                    }.bind(this)
                });
            });

            it('should return the available song with indication of muted', function () {
                expect(this.response).not.toEqual(null);
            });

        });

        xit('Should be able to login to YouTube', function () {
            YouTubeV3API.doYouTubeLogin();
        });

    });

});