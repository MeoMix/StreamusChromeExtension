define([
    'background/model/clientError'
], function (ClientError) {
    'use strict';

    var ClientErrors = Backbone.Collection.extend({
        model: ClientError,
        url: Streamus.serverUrl + 'ClientError/',
        //  Don't allow duplicate ClientErrors by stack + lineNumber. 
        add: function (addedClientError) {
            var isDuplicate = this.any(function (clientError) {
                var lineNumberDuplicate = clientError.get('lineNumber') === addedClientError.get('lineNumber');
                var stackDuplicate = clientError.get('stack') === addedClientError.get('stack');

                return lineNumberDuplicate && stackDuplicate;
            });

            return isDuplicate ? false : Backbone.Collection.prototype.add.apply(this, arguments);
        }
    });

    return ClientErrors;
})