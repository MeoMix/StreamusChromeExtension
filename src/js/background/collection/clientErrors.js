import {Collection, Model} from 'backbone';
import ClientError from 'background/model/clientError';

var ClientErrors = Collection.extend({
  model: ClientError,

  url: function() {
    return StreamusBG.serverUrl + 'ClientError/';
  },

  // Don't allow duplicate ClientErrors by stack + lineNumber.
  add: function(clientError) {
    var isAddingModel = clientError instanceof Model;
    var lineNumber = isAddingModel ? clientError.get('lineNumber') : clientError.lineNumber;
    var stack = isAddingModel ? clientError.get('stack') : clientError.stack;
    var hasDuplicate = this._hasDuplicate(lineNumber, stack);

    return hasDuplicate ? false : Collection.prototype.add.apply(this, arguments);
  },

  // Returns whether the given lineNumber and stack match an existing model
  _hasDuplicate: function(lineNumber, stack) {
    var hasDuplicate = this.any(function(clientError) {
      var isMatchingLineNumber = clientError.get('lineNumber') === lineNumber;
      var isMatchingStack = clientError.get('stack') === stack;
      var isDuplicate = isMatchingLineNumber && isMatchingStack;

      return isDuplicate;
    });

    return hasDuplicate;
  }
});

export default ClientErrors;