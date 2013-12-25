define([
    'common/googleAPI'
], function (GoogleAPI) {
    'use strict';

    describe('GoogleAPI', function () {

        it('Should load asynchronously properly', function () {
            expect(GoogleAPI).not.toEqual(null);
            expect(GoogleAPI.client).not.toEqual(null);
        });

    });

});

