define([
    'utility',
    'dataSource'
], function (Utility, DataSource) {
    'use strict';
    
    describe('Utility', function () {

        it('Should be able to convert ISO8061 Duration to Seconds', function () {
            expect(Utility.iso8061DurationToSeconds('PT0H0M0S')).toEqual(0);
            expect(Utility.iso8061DurationToSeconds('PT0H0M1S')).toEqual(1);
            expect(Utility.iso8061DurationToSeconds('PT0H0M60S')).toEqual(60);
            expect(Utility.iso8061DurationToSeconds('PT0H1M0S')).toEqual(60);
            expect(Utility.iso8061DurationToSeconds('PT0H60M0S')).toEqual(3600);
            expect(Utility.iso8061DurationToSeconds('PT1H0M0S')).toEqual(3600);
            // 52S + (3 * 60S) + (1 * 60 * 60S) = 3832
            expect(Utility.iso8061DurationToSeconds('PT1H3M52S')).toEqual(3832);
        });

        it('Should be able to pretty print time in seconds.', function() {
            expect(Utility.prettyPrintTime(0)).toEqual('00:00');
            expect(Utility.prettyPrintTime(1)).toEqual('00:01');
            expect(Utility.prettyPrintTime(60)).toEqual('01:00');
            expect(Utility.prettyPrintTime(61)).toEqual('01:01');
            expect(Utility.prettyPrintTime(600)).toEqual('10:00');
            expect(Utility.prettyPrintTime(601)).toEqual('10:01');
            expect(Utility.prettyPrintTime(601)).toEqual('10:01');
            expect(Utility.prettyPrintTime(3599)).toEqual('59:59');
            expect(Utility.prettyPrintTime(3600)).toEqual('1:00:00');
            expect(Utility.prettyPrintTime(3601)).toEqual('1:00:01');
            expect(Utility.prettyPrintTime(86400)).toEqual('24:00:00');
        });
        
        it('Should be able to parse a YouTube video id from a variety of URL patterns', function() {
            expect(Utility.parseVideoIdFromUrl('http://www.youtube.com/watch?v=6od4WeaWDcs')).toEqual('6od4WeaWDcs');
            expect(Utility.parseVideoIdFromUrl('http://youtu.be/3sg6KCayu0E')).toEqual('3sg6KCayu0E');
            expect(Utility.parseVideoIdFromUrl('http://www.youtube.com/watch?feature=youtu.be&v=aKpLrmQsS_M')).toEqual('aKpLrmQsS_M');
            
            //  10 digit URL is not valid:
            expect(Utility.parseVideoIdFromUrl('http://youtu.be/3sg6KCau0E')).toEqual(null);
            //  12 digit URL is not valid
            expect(Utility.parseVideoIdFromUrl('http://youtu.be/3sg6KaaCau0E')).toEqual(null);
        });

        it('Should be able to escape an unsafe string', function() {
            expect(Utility.htmlEscape('&')).toEqual('&amp;');
            expect(Utility.htmlEscape('<')).toEqual('&lt;');
            expect(Utility.htmlEscape('>')).toEqual('&gt;');
            expect(Utility.htmlEscape('"')).toEqual('&qot;');
        });

        //  TODO: Finish testing this one. It can cleanse more than just this.
        it('Should be able to cleanse a YouTube video title', function() {
            expect(Utility.cleanseVideoTitle(' ')).toEqual('');
            expect(Utility.cleanseVideoTitle('**NEW**')).toEqual('');
            expect(Utility.cleanseVideoTitle('[1999]')).toEqual('');
            expect(Utility.cleanseVideoTitle('(1999)')).toEqual('');
            expect(Utility.cleanseVideoTitle('(best version)')).toEqual('');
            expect(Utility.cleanseVideoTitle('official music video')).toEqual('');
            expect(Utility.cleanseVideoTitle('ALBUM TRACK')).toEqual('');
        });

        it('Should be able to get the Levenshtein Distance between two strings', function() {
            expect(Utility.getLevenshteinDistance('', '')).toEqual(0);
            expect(Utility.getLevenshteinDistance('a', 'a')).toEqual(0);
            expect(Utility.getLevenshteinDistance('a', '')).toEqual(1);
            expect(Utility.getLevenshteinDistance('', 'a')).toEqual(1);
            expect(Utility.getLevenshteinDistance('b', 'a')).toEqual(1);
            expect(Utility.getLevenshteinDistance('a', 'b')).toEqual(1);
            expect(Utility.getLevenshteinDistance('aa', 'b')).toEqual(2);
            expect(Utility.getLevenshteinDistance('bb', 'b')).toEqual(1);
        });

        it('Should be able to parse a variety of URLs for their DataSource', function () {

            expect(Utility.parseUrlForDataSource('http://www.youtube.com/playlist?list=PL63F0C78739B09958')).toEqual({
                id: '63F0C78739B09958',
                type: DataSource.YOUTUBE_PLAYLIST
            });
            
            expect(Utility.parseUrlForDataSource('http://www.youtube.com/playlist?p=PL63F0C78739B09958')).toEqual({
                id: '63F0C78739B09958',
                type: DataSource.YOUTUBE_PLAYLIST
            });
            
            expect(Utility.parseUrlForDataSource('http://www.youtube.com/playlist?list=FL-SyDtP6JOvHZVcRrZrXnyA')).toEqual({
                id: '-SyDtP6JOvHZVcRrZrXnyA',
                type: DataSource.YOUTUBE_FAVORITES
            });

            expect(Utility.parseUrlForDataSource('http://www.youtube.com/playlist?p=FL-SyDtP6JOvHZVcRrZrXnyA')).toEqual({
                id: '-SyDtP6JOvHZVcRrZrXnyA',
                type: DataSource.YOUTUBE_FAVORITES
            });

            //  A variety of URLs work when identifying a YouTube channel:
            expect(Utility.parseUrlForDataSource('http://www.youtube.com/channel/UCXIyz409s7bNWVcM-vjfdVA')).toEqual({
                id: 'UCXIyz409s7bNWVcM-vjfdVA',
                type: DataSource.YOUTUBE_CHANNEL
            });
            
            expect(Utility.parseUrlForDataSource('http://www.youtube.com/user/majesticcasual')).toEqual({
                id: 'majesticcasual',
                type: DataSource.YOUTUBE_CHANNEL
            });
            
            expect(Utility.parseUrlForDataSource('http://www.youtube.com/playlist?list=UU-e1BqfubuSdFPHauQwZmlg')).toEqual({
                id: '-e1BqfubuSdFPHauQwZmlg',
                type: DataSource.YOUTUBE_CHANNEL
            });
            
            expect(Utility.parseUrlForDataSource('http://www.youtube.com/playlist?p=UU-e1BqfubuSdFPHauQwZmlg')).toEqual({
                id: '-e1BqfubuSdFPHauQwZmlg',
                type: DataSource.YOUTUBE_CHANNEL
            });
            
            //  TODO: Support Shared_Playlist again.
            //expect(Utility.parseUrlForDataSource('streamus:')).toEqual({
            //    id: '',
            //    type: DataSource.SHARED_PLAYLIST
            //});

            //  V3 API expects the full ID paramater while V2 does not expect the leading identifier.
            expect(Utility.parseUrlForDataSource('http://www.youtube.com/playlist?p=ALYL4kY05133rTMhTulSaXKj_Y6el9q0JH')).toEqual({
                id: 'ALYL4kY05133rTMhTulSaXKj_Y6el9q0JH',
                type: DataSource.YOUTUBE_AUTOGENERATED
            });
            
            expect(Utility.parseUrlForDataSource('http://www.youtube.com/playlist?list=ALYL4kY05133rTMhTulSaXKj_Y6el9q0JH')).toEqual({
                id: 'ALYL4kY05133rTMhTulSaXKj_Y6el9q0JH',
                type: DataSource.YOUTUBE_AUTOGENERATED
            });
        });

    });
    
});

