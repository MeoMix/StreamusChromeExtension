define(function (require) {
    'use strict';

    var Utility = require('common/utility');
    
    describe('Utility', function () {
        it('Should be able to convert ISO8061 Duration to Seconds', function () {
            expect(Utility.iso8061DurationToSeconds('PT0H0M0S')).to.equal(0);
            expect(Utility.iso8061DurationToSeconds('PT0H0M1S')).to.equal(1);
            expect(Utility.iso8061DurationToSeconds('PT0H0M60S')).to.equal(60);
            expect(Utility.iso8061DurationToSeconds('PT0H1M0S')).to.equal(60);
            expect(Utility.iso8061DurationToSeconds('PT0H60M0S')).to.equal(3600);
            expect(Utility.iso8061DurationToSeconds('PT1H0M0S')).to.equal(3600);
            // 52S + (3 * 60S) + (1 * 60 * 60S) = 3832
            expect(Utility.iso8061DurationToSeconds('PT1H3M52S')).to.equal(3832);
        });

        it('Should be able to pretty print time in seconds.', function() {
            expect(Utility.prettyPrintTime(0)).to.equal('00:00');
            expect(Utility.prettyPrintTime(1)).to.equal('00:01');
            expect(Utility.prettyPrintTime(60)).to.equal('01:00');
            expect(Utility.prettyPrintTime(61)).to.equal('01:01');
            expect(Utility.prettyPrintTime(600)).to.equal('10:00');
            expect(Utility.prettyPrintTime(601)).to.equal('10:01');
            expect(Utility.prettyPrintTime(601)).to.equal('10:01');
            expect(Utility.prettyPrintTime(3599)).to.equal('59:59');
            expect(Utility.prettyPrintTime(3600)).to.equal('1:00:00');
            expect(Utility.prettyPrintTime(3601)).to.equal('1:00:01');
            expect(Utility.prettyPrintTime(86400)).to.equal('24:00:00');
        });

        it('Should be able to cleanse a YouTube song title', function() {
            expect(Utility.cleanTitle(' ')).to.equal('');
            expect(Utility.cleanTitle('**NEW**')).to.equal('');
            expect(Utility.cleanTitle('[1999]')).to.equal('');
            expect(Utility.cleanTitle('(1999)')).to.equal('');
            expect(Utility.cleanTitle('(best version)')).to.equal('');
            expect(Utility.cleanTitle('official music video')).to.equal('');
            expect(Utility.cleanTitle('ALBUM TRACK')).to.equal('');
            expect(Utility.cleanTitle('(official)')).to.equal('');
            expect(Utility.cleanTitle('x (HD)')).to.equal('x');
            expect(Utility.cleanTitle('x HQ ')).to.equal('x');
            expect(Utility.cleanTitle('video clip')).to.equal('');
            expect(Utility.cleanTitle('x live')).to.equal('x');
            expect(Utility.cleanTitle('with lyrics')).to.equal('');
            expect(Utility.cleanTitle('artist - "track title"')).to.equal('track title');
        });
    });
});

