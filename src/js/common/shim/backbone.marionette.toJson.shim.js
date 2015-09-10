//
// toJsonShim
// Marionette v2.x Views use toJSON for serialization, which isn't
// the intended use of that method. This resolves that problem.
//

import _ from 'common/shim/lodash.reference.shim';
import {View, ItemView} from 'marionette';

View.prototype.serializeModel = function(model) {
  model = model || this.model;
  return _.clone(model.attributes);
};

ItemView.prototype.serializeCollection = function(collection) {
  return collection.map(function(model) { return this.serializeModel(model); }, this);
};