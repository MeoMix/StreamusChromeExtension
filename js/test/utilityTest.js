define([
    'utility'
], function (Utility) {
    'use strict';
    
    describe('Utility', function () {

        //  TODO: Add more combinations of iso date conversions.
        it('Should be able to convert ISO8061 Duration to Seconds', function () {
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

        //  TODO: Find a few more supported YouTube URL patterns.
        it('Should be able to parse a YouTube video id from a variety of URL patterns', function() {
            expect(Utility.parseVideoIdFromUrl('http://www.youtube.com/watch?v=6od4WeaWDcs')).toEqual('6od4WeaWDcs');
            expect(Utility.parseVideoIdFromUrl('http://youtu.be/3sg6KCayu0E')).toEqual('3sg6KCayu0E');
            expect(Utility.parseVideoIdFromUrl('http://www.youtube.com/watch?feature=youtu.be&v=aKpLrmQsS_M')).toEqual('aKpLrmQsS_M');
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

    });
    
});

