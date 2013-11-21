define([
    'utility'
], function (Utility) {
    'use strict';
    
    describe('Utility', function () {

        it('Should be able to convert ISO8061 Duration to Seconds', function () {

            var iso8061Duration = 'PT1H3M52S';

            var secondsDuration = Utility.iso8061DurationToSeconds(iso8061Duration);
            
            // 52S + (3 * 60S) + (1 * 60 * 60S) = 3832
            expect(secondsDuration).toEqual(3832);

        });

    });
    
});

