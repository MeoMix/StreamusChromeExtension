define(function(require) {
    'use strict';

    var DataSource = require('background/model/dataSource');
    var YouTubeV3API = require('background/model/youTubeV3API');
    var DataSourceType = require('common/enum/dataSourceType');

    describe('DataSource', function() {
        var expectDataSource = function(dataSource, expectations) {
            expectations = expectations || {};
            expect(dataSource.get('entityId')).to.equal(expectations.entityId === undefined ? dataSource.defaults.entityId : expectations.entityId);
            expect(dataSource.get('type')).to.equal(expectations.type === undefined ? dataSource.defaults.type : expectations.type);
        };

        it('Should initialize properly', function() {
            expectDataSource(new DataSource());
        });

        describe('when parsing YouTube Playlist URLs', function() {
            it('should handle ?list= URLs', function(done) {
                var dataSource = new DataSource({ url: 'http://www.youtube.com/playlist?list=PL63F0C78739B09958' });
                dataSource.parseUrl({
                    success: function() {
                        expectDataSource(dataSource, {
                            entityId: 'PL63F0C78739B09958',
                            type: DataSourceType.YouTubePlaylist
                        });

                        done();
                    }
                });
            });

            it('should handle ?p= URLs', function(done) {
                var dataSource = new DataSource({ url: 'http://www.youtube.com/playlist?p=PL63F0C78739B09958' });

                dataSource.parseUrl({
                    success: function() {
                        expectDataSource(dataSource, {
                            entityId: 'PL63F0C78739B09958',
                            type: DataSourceType.YouTubePlaylist
                        });

                        done();
                    }
                });
            });
        });

        describe('when parsing YouTube Favorites URLs', function() {
            it('should handle ?list= URLs', function(done) {
                var dataSource = new DataSource({ url: 'http://www.youtube.com/playlist?list=FL-SyDtP6JOvHZVcRrZrXnyA' });
                dataSource.parseUrl({
                    success: function() {
                        expectDataSource(dataSource, {
                            entityId: 'FL-SyDtP6JOvHZVcRrZrXnyA',
                            type: DataSourceType.YouTubePlaylist
                        });

                        done();
                    }
                });
            });

            it('should handle ?p= URLs', function(done) {
                var dataSource = new DataSource({ url: 'http://www.youtube.com/playlist?p=FL-SyDtP6JOvHZVcRrZrXnyA' });

                dataSource.parseUrl({
                    success: function() {
                        expectDataSource(dataSource, {
                            entityId: 'FL-SyDtP6JOvHZVcRrZrXnyA',
                            type: DataSourceType.YouTubePlaylist
                        });

                        done();
                    }
                });
            });
        });

        describe('when parsing YouTube Channel Uploads URLs', function() {
            it('should handle ?list= URLs', function(done) {
                var dataSource = new DataSource({ url: 'http://www.youtube.com/playlist?list=UU-e1BqfubuSdFPHauQwZmlg' });
                dataSource.parseUrl({
                    success: function() {
                        expectDataSource(dataSource, {
                            entityId: 'UU-e1BqfubuSdFPHauQwZmlg',
                            type: DataSourceType.YouTubePlaylist
                        });

                        done();
                    }
                });
            });

            it('should handle ?p= URLs', function(done) {
                var dataSource = new DataSource({ url: 'http://www.youtube.com/playlist?p=UU-e1BqfubuSdFPHauQwZmlg' });

                dataSource.parseUrl({
                    success: function() {
                        expectDataSource(dataSource, {
                            entityId: 'UU-e1BqfubuSdFPHauQwZmlg',
                            type: DataSourceType.YouTubePlaylist
                        });

                        done();
                    }
                });
            });
        });

        describe('when parsing YouTube Auto-Generated Playlist URLs', function() {
            it('should handle ?list= URLs', function(done) {
                var dataSource = new DataSource({ url: 'http://www.youtube.com/playlist?p=ALYL4kY05133rTMhTulSaXKj_Y6el9q0JH' });
                dataSource.parseUrl({
                    success: function() {
                        expectDataSource(dataSource, {
                            entityId: 'ALYL4kY05133rTMhTulSaXKj_Y6el9q0JH',
                            type: DataSourceType.YouTubePlaylist
                        });

                        done();
                    }
                });
            });

            it('should handle ?p= URLs', function(done) {
                var dataSource = new DataSource({ url: 'http://www.youtube.com/playlist?list=ALYL4kY05133rTMhTulSaXKj_Y6el9q0JH' });

                dataSource.parseUrl({
                    success: function() {
                        expectDataSource(dataSource, {
                            entityId: 'ALYL4kY05133rTMhTulSaXKj_Y6el9q0JH',
                            type: DataSourceType.YouTubePlaylist
                        });

                        done();
                    }
                });
            });
        });

        it('should get the title of a parsable URL', function(done) {
            var dataSource = new DataSource({
                url: 'http://www.youtube.com/channel/UCXIyz409s7bNWVcM-vjfdVA'
            });

            var channelTitle = 'Majestic Casual';
            sinon.stub(YouTubeV3API, 'getTitle').yieldsTo('success', channelTitle);

            dataSource.getTitle({
                success: function(title) {
                    expect(title).to.equal(channelTitle);
                    expect(dataSource.get('title')).to.equal(channelTitle);
                    done();
                },
                error: _.noop
            });

            YouTubeV3API.getTitle.restore();
        });

        it('Should be able to successfully indicate whether it isYouTubePlaylist', function() {
            var dataSource = new DataSource({ type: DataSourceType.YouTubePlaylist });
            expect(dataSource.isYouTubePlaylist()).to.equal(true);

            dataSource = new DataSource({ type: DataSourceType.None });
            expect(dataSource.isYouTubePlaylist()).to.equal(false);

            dataSource = new DataSource({ type: DataSourceType.UserInput });
            expect(dataSource.isYouTubePlaylist()).to.equal(false);
        });

        it('Should be able to parse a YouTube song id from a variety of URL patterns', function() {
            expect((new DataSource())._parseYouTubeSongIdFromUrl('http://www.youtube.com/watch?v=6od4WeaWDcs')).to.equal('6od4WeaWDcs');
            expect((new DataSource())._parseYouTubeSongIdFromUrl('http://youtu.be/3sg6KCayu0E')).to.equal('3sg6KCayu0E');
            expect((new DataSource())._parseYouTubeSongIdFromUrl('http://www.youtube.com/watch?feature=youtu.be&v=aKpLrmQsS_M')).to.equal('aKpLrmQsS_M');
            expect((new DataSource())._parseYouTubeSongIdFromUrl('http://www.youtube.com/watch?feature=player_embedded&v=MKS8Jn_3bnA')).to.equal('MKS8Jn_3bnA');
            //  10 digit URL is not valid:
            expect((new DataSource())._parseYouTubeSongIdFromUrl('http://youtu.be/3sg6KCau0E')).to.equal('');
            //  12 digit URL is not valid
            expect((new DataSource())._parseYouTubeSongIdFromUrl('http://youtu.be/3sg6KaaCau0E')).to.equal('');
        });

        describe('when parsing YouTube Channel URLs', function() {
            it('should handle /channel/ URLs', function(done) {
                var dataSource = new DataSource({ url: 'http://www.youtube.com/channel/UCXIyz409s7bNWVcM-vjfdVA' });

                sinon.stub(YouTubeV3API, 'getChannelUploadsPlaylistId').yieldsTo('success', {
                    uploadsPlaylistId: 'UUXIyz409s7bNWVcM-vjfdVA'
                });

                dataSource.parseUrl({
                    success: function() {
                        expectDataSource(dataSource, {
                            entityId: 'UUXIyz409s7bNWVcM-vjfdVA',
                            type: DataSourceType.YouTubePlaylist
                        });

                        done();
                    }
                });

                YouTubeV3API.getChannelUploadsPlaylistId.restore();
            });

            it('should handle /user/ URLs', function(done) {
                var dataSource = new DataSource({ url: 'http://www.youtube.com/user/majesticcasual' });

                sinon.stub(YouTubeV3API, 'getChannelUploadsPlaylistId').yieldsTo('success', {
                    uploadsPlaylistId: 'UUXIyz409s7bNWVcM-vjfdVA'
                });

                dataSource.parseUrl({
                    success: function() {
                        expectDataSource(dataSource, {
                            entityId: 'UUXIyz409s7bNWVcM-vjfdVA',
                            type: DataSourceType.YouTubePlaylist
                        });

                        done();
                    }
                });

                YouTubeV3API.getChannelUploadsPlaylistId.restore();
            });
        });
    });
});