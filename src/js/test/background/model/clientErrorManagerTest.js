define([
   'background/model/clientErrorManager'
], function(ClientErrorManager) {
    'use strict';

    describe('ClientErrorManager', function () {
        beforeEach(function () {
            //  TODO: I would prefer to stub reportedErrors, but ClientErrorManager is a singleton which makes it impossible.
            sinon.stub(Backbone, 'sync');
            ClientErrorManager.get('reportedErrors').reset();
        });

        afterEach(function () {
            Backbone.sync.restore();
        });

        it('should log an error message properly', function() {
            ClientErrorManager.logErrorMessage('test message');

            expect(ClientErrorManager.get('reportedErrors').length).to.equal(1);
        });
        
        it('should log not log the same error message more than once', function () {
            for (var i = 0; i < 5; i++) {
                ClientErrorManager.logErrorMessage('test message');
            }
            
            expect(ClientErrorManager.get('reportedErrors').length).to.equal(1);
        });
    });
})