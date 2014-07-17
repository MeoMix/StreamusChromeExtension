define([
    'background/model/clientError'
], function (ClientError) {
    'use strict';

    describe('ClientError', function () {
        it('Should truncate a long message properly when initializing', function () {
            var clientError = new ClientError({
                message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce at pharetra dolor, non bibendum sapien. Sed tellus lectus, pellentesque eu tincidunt ut, dictum et urna. Proin pretium eget nibh id rutrum. Nam at convallis enim. Sed mi dolor, tempor nec turpis quis, egestas consequat ligula. Ut cursus elementum ligula, vitae ultrices ante feugiat in. Sed aliquam eros lorem. Pellentesque sed venenatis sem.'
            });

            expect(clientError.get('message').length).to.be.below(256);
        });

        it('Should throw a validation error when saving too long of a message', function() {
            var clientError = new ClientError({
                message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce at pharetra dolor, non bibendum sapien. Sed tellus lectus, pellentesque eu tincidunt ut, dictum et urna. Proin pretium eget nibh id rutrum. Nam at convallis enim. Sed mi dolor, tempor nec turpis quis, egestas consequat ligula. Ut cursus elementum ligula, vitae ultrices ante feugiat in. Sed aliquam eros lorem. Pellentesque sed venenatis sem.'
            });
            
            //  Don't pass the { validate: true } param here. Relying on the implicit validate of .save();
            clientError.set('message', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce at pharetra dolor, non bibendum sapien. Sed tellus lectus, pellentesque eu tincidunt ut, dictum et urna. Proin pretium eget nibh id rutrum. Nam at convallis enim. Sed mi dolor, tempor nec turpis quis, egestas consequat ligula. Ut cursus elementum ligula, vitae ultrices ante feugiat in. Sed aliquam eros lorem. Pellentesque sed venenatis sem.');
            clientError.save();

            //  The validationError property should be set after save fails.
            expect(clientError.validationError).not.to.equal(null);
            expect(clientError.validationError.length).to.be.above(0);
            expect(clientError.isValid()).to.equal(false);
        });
    });
});

