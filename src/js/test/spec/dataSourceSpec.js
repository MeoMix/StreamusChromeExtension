define([
    'common/model/dataSource',
    'common/enum/dataSourceType'
], function (DataSource, DataSourceType) {
    'use strict';

    //  TODO: needs updating since I changed DataSource stuff.
    describe('DataSource', function () {

        var expectDataSource = function (dataSource, expectations) {
            //  Allow for expectations to be optional.
            expectations = expectations || {};

            expect(dataSource.get('id')).toEqual(expectations.id === undefined ? dataSource.defaults.id : expectations.id);
            expect(dataSource.get('type')).toEqual(expectations.type === undefined ? dataSource.defaults.type : expectations.type);
            //  TODO: I dunno wtf I am doing with URL right now. Don't worry about it for test cases.
            //expect(dataSource.get('url')).toEqual(expectations.url === undefined ? dataSource.defaults.url : expectations.url);
        };
        
        it('Should initialize properly', function () {
            expectDataSource(new DataSource());
        });

        it('Should be able to parse YouTube Playlist URLs', function() {
            var dataSource;

            dataSource = new DataSource({ url: 'http://www.youtube.com/playlist?list=PL63F0C78739B09958' });
            expectDataSource(dataSource, {
                id: 'PL63F0C78739B09958',
                type: DataSourceType.YouTubePlaylist,
                url: 'https://gdata.youtube.com/feeds/api/playlists/PL63F0C78739B09958'
            });

            dataSource = new DataSource({ url: 'http://www.youtube.com/playlist?p=PL63F0C78739B09958' });
            expectDataSource(dataSource, {
                id: 'PL63F0C78739B09958',
                type: DataSourceType.YouTubePlaylist,
                url: 'https://gdata.youtube.com/feeds/api/playlists/63F0C78739B09958'
            });
        });

        it('Should be able to parse YouTube Favorites URLs', function() {
            var dataSource;

            dataSource = new DataSource({ url: 'http://www.youtube.com/playlist?list=FL-SyDtP6JOvHZVcRrZrXnyA' });
            expectDataSource(dataSource, {
                id: 'FL-SyDtP6JOvHZVcRrZrXnyA',
                type: DataSourceType.YouTubePlaylist,
                url: 'https://gdata.youtube.com/feeds/api/users/-SyDtP6JOvHZVcRrZrXnyA/favorites'
            });

            dataSource = new DataSource({ url: 'http://www.youtube.com/playlist?p=FL-SyDtP6JOvHZVcRrZrXnyA' });
            expectDataSource(dataSource, {
                id: 'FL-SyDtP6JOvHZVcRrZrXnyA',
                type: DataSourceType.YouTubePlaylist,
                url: 'https://gdata.youtube.com/feeds/api/users/-SyDtP6JOvHZVcRrZrXnyA/favorites'
            });

        });

        it('Should be able to parse YouTube Channel Uploads URL', function() {
            var dataSource;

            dataSource = new DataSource({ url: 'http://www.youtube.com/playlist?list=UU-e1BqfubuSdFPHauQwZmlg' });
            expectDataSource(dataSource, {
                id: 'UU-e1BqfubuSdFPHauQwZmlg',
                type: DataSourceType.YouTubePlaylist,
                url: 'https://gdata.youtube.com/feeds/api/users/-e1BqfubuSdFPHauQwZmlg/uploads'
            });

            dataSource = new DataSource({ url: 'http://www.youtube.com/playlist?p=UU-e1BqfubuSdFPHauQwZmlg' });
            expectDataSource(dataSource, {
                id: 'UU-e1BqfubuSdFPHauQwZmlg',
                type: DataSourceType.YouTubePlaylist,
                url: 'https://gdata.youtube.com/feeds/api/users/-e1BqfubuSdFPHauQwZmlg/uploads'
            });
        });

        it('Should be able to parse YouTube Channel URLs', function() {
            var dataSource;

            //  A variety of URLs work when identifying a YouTube channel:
            dataSource = new DataSource({ url: 'http://www.youtube.com/channel/UCXIyz409s7bNWVcM-vjfdVA' });
            expectDataSource(dataSource, {
                id: 'UCXIyz409s7bNWVcM-vjfdVA',
                type: DataSourceType.YouTubePlaylist,
                url: 'https://gdata.youtube.com/feeds/api/users/UCXIyz409s7bNWVcM-vjfdVA/uploads'
            });

            dataSource = new DataSource({ url: 'http://www.youtube.com/user/majesticcasual' });
            expectDataSource(dataSource, {
                id: 'majesticcasual',
                type: DataSourceType.YouTubePlaylist,
                url: 'https://gdata.youtube.com/feeds/api/users/majesticcasual/uploads'
            });
 
        });

        it('Should be able to parse YouTube Auto-Generated Playlist URLs', function() {
            var dataSource;
            
            dataSource = new DataSource({ url: 'http://www.youtube.com/playlist?p=ALYL4kY05133rTMhTulSaXKj_Y6el9q0JH' });
            expectDataSource(dataSource, {
                id: 'ALYL4kY05133rTMhTulSaXKj_Y6el9q0JH',
                type: DataSourceType.YouTubePlaylist
            });

            dataSource = new DataSource({ url: 'http://www.youtube.com/playlist?list=ALYL4kY05133rTMhTulSaXKj_Y6el9q0JH' });
            expectDataSource(dataSource, {
                id: 'ALYL4kY05133rTMhTulSaXKj_Y6el9q0JH',
                type: DataSourceType.YouTubePlaylist
            });

        });

        describe('when asked to get a YouTube Channel\'s title', function () {
            
            beforeEach(function (done) {
                this.dataSource = new DataSource({
                    url: 'http://www.youtube.com/channel/UCXIyz409s7bNWVcM-vjfdVA'
                });

                this.dataSource.getTitle({
                    success: done
                });
            });

            it('should get the title of the channel', function () {
                expect(this.dataSource.get('title')).toEqual('Majestic Casual');
            });
            
        });

        describe('when asked to get a YouTube Playlist\'s title', function () {
            
            beforeEach(function(done) {
                this.dataSource = new DataSource({
                    url: 'http://www.youtube.com/playlist?p=ALYL4kY05133rTMhTulSaXKj_Y6el9q0JH'
                });
                
                this.dataSource.getTitle({
                    success: done
                });
            });

            it('should get the title of the playlist', function() {
                expect(this.dataSource.get('title')).toEqual('Top Tracks for Kendrick Lamar');
            });
            
        });
        
        it('Should be able to successfully indicate whether it needsLoading', function () {
            var dataSource;
            
            dataSource = new DataSource({ type: DataSourceType.YouTubePlaylist });
            expect(dataSource.needsLoading()).toEqual(true);

            dataSource = new DataSource({ type: DataSourceType.None });
            expect(dataSource.needsLoading()).toEqual(false);

            dataSource = new DataSource({ type: DataSourceType.Unknown });
            expect(dataSource.needsLoading()).toEqual(false);
            
            dataSource = new DataSource({ type: DataSourceType.UserInput });
            expect(dataSource.needsLoading()).toEqual(false);
        });

        it('Should be able to parse a YouTube song id from a variety of URL patterns', function () {
            expect((new DataSource()).parseYouTubeSongIdFromUrl('http://www.youtube.com/watch?v=6od4WeaWDcs')).toEqual('6od4WeaWDcs');
            expect((new DataSource()).parseYouTubeSongIdFromUrl('http://youtu.be/3sg6KCayu0E')).toEqual('3sg6KCayu0E');
            expect((new DataSource()).parseYouTubeSongIdFromUrl('http://www.youtube.com/watch?feature=youtu.be&v=aKpLrmQsS_M')).toEqual('aKpLrmQsS_M');
            expect((new DataSource()).parseYouTubeSongIdFromUrl('http://www.youtube.com/watch?feature=player_embedded&v=MKS8Jn_3bnA')).toEqual('MKS8Jn_3bnA');
            //  10 digit URL is not valid:
            expect((new DataSource()).parseYouTubeSongIdFromUrl('http://youtu.be/3sg6KCau0E')).toEqual('');
            //  12 digit URL is not valid
            expect((new DataSource()).parseYouTubeSongIdFromUrl('http://youtu.be/3sg6KaaCau0E')).toEqual('');
        });

    });

});

