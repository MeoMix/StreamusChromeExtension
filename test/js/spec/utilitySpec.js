define([
    'common/model/utility'
], function (Utility) {
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

    });
    
});

