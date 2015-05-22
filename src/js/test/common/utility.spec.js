define(function(require) {
    'use strict';

    var Utility = require('common/utility');

    describe('Utility', function() {
        it('Should be able to convert ISO8061 Duration to Seconds', function() {
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

        it('should be able to shift an offset when it exceeds the right-side of the container', function() {
            var offset = 950;
            var containerLength = 1000;
            var elementLength = 100;

            var adjustedOffset = Utility.shiftOffset(offset, elementLength, containerLength);
            expect(adjustedOffset).not.to.equal(offset);
            expect(adjustedOffset).to.equal(900);
        });

        it('should be able to shift an offset when it exceeds the left-side of the container', function() {
            var offset = -50;
            var containerLength = 1000;
            var elementLength = 100;

            var adjustedOffset = Utility.shiftOffset(offset, elementLength, containerLength);
            expect(adjustedOffset).not.to.equal(offset);
            expect(adjustedOffset).to.equal(0);
        });

        it('should be able to not shift an offset when its left-edge fits in the container', function() {
            var offset = 0;
            var containerLength = 1000;
            var elementLength = 100;

            var adjustedOffset = Utility.shiftOffset(offset, elementLength, containerLength);
            expect(adjustedOffset).to.equal(offset);
        });

        it('should be able to not shift an offset when its right-edge fits in the container', function() {
            var offset = 900;
            var containerLength = 1000;
            var elementLength = 100;

            var adjustedOffset = Utility.shiftOffset(offset, elementLength, containerLength);
            expect(adjustedOffset).to.equal(offset);
        });

        it('should be able to flipInvert an offset when trying to position the element below the target', function() {
            var offset = 950;
            var containerLength = 1000;
            var adjust = 0;
            var targetLength = 200;
            var elementLength = 100;

            var adjustedOffset = Utility.flipInvertOffset(offset, elementLength, containerLength, targetLength, adjust);
            expect(adjustedOffset).not.to.equal(offset);
            expect(adjustedOffset).to.equal(650);
        });

        it('should be able to flipInvert an offset when trying to position the element above the target', function() {
            var offset = -50;
            var containerLength = 1000;
            var adjust = 0;
            var targetLength = 200;
            var elementLength = 100;

            var adjustedOffset = Utility.flipInvertOffset(offset, elementLength, containerLength, targetLength, adjust);
            expect(adjustedOffset).not.to.equal(offset);
            expect(adjustedOffset).to.equal(250);
        });

        it('should be able to not flipInvert an offset', function() {
            var offset = 0;
            var containerLength = 1000;
            var adjust = 0;
            var targetLength = 200;
            var elementLength = 100;

            var adjustedOffset = Utility.flipInvertOffset(offset, elementLength, containerLength, targetLength, adjust);
            expect(adjustedOffset).to.equal(offset);
        });
    });
});