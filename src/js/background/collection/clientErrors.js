define(function(require) {
    'use strict';

    var ClientError = require('background/model/clientError');

    var ClientErrors = Backbone.Collection.extend({
        model: ClientError,
        url: function() {
            return Streamus.serverUrl + 'ClientError/';
        },
        // Don't allow duplicate ClientErrors by stack + lineNumber.
        add: function(addedClientError) {
            var isDuplicate = this.any(function(clientError) {
                var lineNumberDuplicate = clientError.get('lineNumber') === addedClientError.get('lineNumber');
                var stackDuplicate = clientError.get('stack') === addedClientError.get('stack');

                return lineNumberDuplicate && stackDuplicate;
            });

            return isDuplicate ? false : Backbone.Collection.prototype.add.apply(this, arguments);
        }
    });

    return ClientErrors;
});