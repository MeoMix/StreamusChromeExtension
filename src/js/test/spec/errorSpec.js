define([
    'background/model/error'
], function (Error) {
    'use strict';

    describe('Error', function () {

        it('Should truncate a long message properly when initializing', function () {
            var error = new Error({
                message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce at pharetra dolor, non bibendum sapien. Sed tellus lectus, pellentesque eu tincidunt ut, dictum et urna. Proin pretium eget nibh id rutrum. Nam at convallis enim. Sed mi dolor, tempor nec turpis quis, egestas consequat ligula. Ut cursus elementum ligula, vitae ultrices ante feugiat in. Sed aliquam eros lorem. Pellentesque sed venenatis sem.'
            });

            expect(error.get('message').length).toBeLessThan(256);
        });

        it('Should throw a validation error when saving too long of a message', function() {

            var error = new Error({
                message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce at pharetra dolor, non bibendum sapien. Sed tellus lectus, pellentesque eu tincidunt ut, dictum et urna. Proin pretium eget nibh id rutrum. Nam at convallis enim. Sed mi dolor, tempor nec turpis quis, egestas consequat ligula. Ut cursus elementum ligula, vitae ultrices ante feugiat in. Sed aliquam eros lorem. Pellentesque sed venenatis sem.'
            });
            
            //  Don't pass the { validate: true } param here. Relying on the implicit validate of .save();
            error.set('message', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce at pharetra dolor, non bibendum sapien. Sed tellus lectus, pellentesque eu tincidunt ut, dictum et urna. Proin pretium eget nibh id rutrum. Nam at convallis enim. Sed mi dolor, tempor nec turpis quis, egestas consequat ligula. Ut cursus elementum ligula, vitae ultrices ante feugiat in. Sed aliquam eros lorem. Pellentesque sed venenatis sem.');
            error.save();

            //  The validationError property should be set after save fails.
            expect(error.validationError).not.toBeNull();
            expect(error.validationError.length).toBeGreaterThan(0);
            expect(error.isValid()).toBe(false);
        });

    });

});

