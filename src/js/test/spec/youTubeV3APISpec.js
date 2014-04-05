define([
    'common/model/youTubeV3API'
], function (YouTubeV3API) {
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
                expect(this.result.length).toEqual(50);
            });
            
        });

        describe('when asked to get related song information', function () {
            
            beforeEach(function (done) {
                this.result = null;

                YouTubeV3API.getRelatedSongInformation({
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

                YouTubeV3API.getSongInformationList({
                    playlistId: 'FL_Gkp1Oa7e2a8NNaf5-KCpA',
                    success: function (response) {
                        this.result = response;
                        done();
                    }.bind(this)
                });
            });

            it('should return a list of playlist items', function () {
                expect(this.result).not.toEqual(null);
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

                YouTubeV3API.getSongInformationList({
                    playlistId: 'UU_Gkp1Oa7e2a8NNaf5-KCpA',
                    success: function (response) {
                        this.result = response;
                        done();
                    }.bind(this)
                });
            });
            
            it('should return a list of playlist items', function () {
                expect(this.result).not.toEqual(null);
                expect(this.result.songInformationList.length).toBeGreaterThan(0);
            });
            
        });
        
        describe('when asked to get a regular playlist\'s playlist items by id', function () {

            beforeEach(function (done) {
                this.result = null;
                
                YouTubeV3API.getSongInformationList({
                    playlistId: 'PLCyVVJA8G-6CPwZ1Gzj_oYody7x_p5ipR',
                    success: function (response) {
                        this.result = response;
                        done();
                    }.bind(this)
                });
            });

            it('should return a list of playlist items', function () {
                expect(this.result).not.toEqual(null);
                expect(this.result.songInformationList.length).toBeGreaterThan(0);
            });
            
        });

        describe('when asked to get an auto-generated playlist\'s items', function () {
            
            beforeEach(function (done) {
                this.result = null;

                YouTubeV3API.getSongInformationList({
                    playlistId: 'ALYL4kY05133rTMhTulSaXKj_Y6el9q0JH',
                    success: function (response) {
                        this.result = response;
                        done();
                    }.bind(this)
                });
            });
            
            it('should return a list of playlist items', function () {
                expect(this.result).not.toEqual(null);
                expect(this.result.songInformationList.length).toBeGreaterThan(0);
            });

        });

        describe('when asked to get an auto-generated playlist\'s title', function () {
            beforeEach(function (done) {
                this.result = null;

                YouTubeV3API.getAutoGeneratedPlaylistTitle({
                    playlistId: 'ALYL4kY05133rTMhTulSaXKj_Y6el9q0JH',
                    success: function (response) {
                        this.result = response;
                        done();
                    }.bind(this)
                });
            });
            
            it('should return the title of the playlist', function () {
                expect(this.result).toEqual('Top Tracks for Kendrick Lamar');
            });

        });

        xit('Should be able to login to YouTube', function () {
            YouTubeV3API.doYouTubeLogin();
        });

    });

});