//
// toJsonShim
// Marionette v2.x Views use toJSON for serialization, which isn't
// the intended use of that method. This resolves that problem.
//

import * as _ from 'lodash';
import * as Marionette from 'marionette';

Marionette.View.prototype.serializeModel = function(model) {
  model = model || this.model;
  return _.clone(model.attributes);
};

Marionette.ItemView.prototype.serializeCollection = function(collection) {
  return collection.map(function(model){ return this.serializeModel(model); }, this);
};