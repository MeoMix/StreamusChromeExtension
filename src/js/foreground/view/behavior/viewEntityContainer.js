define(function() {
  'use strict';

  // Provides event handler unbinding of models or collections given to the implementing view.
  // If a view's entity has bound event listeners and the view is destroyed then those event listeners
  // become a memory leak if no references to the entity remain.
  // If an entity's lifetime is scoped to its view then it can safely bind event listeners if the view implements this Behavior.
  // Example:
  // ViewEntityContainer: {
  //   behaviorClass: ViewEntityContainer,
  //   viewEntityNames: ['model']
  // }
  var ViewEntityContainer = Marionette.Behavior.extend({
    viewEntityNames: null,

    initialize: function(options) {
      // An array of property names which reference models known to the view.
      this.viewEntityNames = options.viewEntityNames || [];
    },

    onRender: function() {
      this._ensureViewEntitys(this.viewEntityNames);
    },

    onBeforeDestroy: function() {
      this._cleanupViewEntitys(this.viewEntityNames);
    },

    // Ensure that the models declared as targets are valid by confirm that they exist
    // and are not attached to other views. If a model is attached to two views and one
    // view is destroyed while the other remains then the second view won't work properly
    // because its model won't have any event handlers configured.
    _ensureViewEntitys: function(viewEntityNames) {
      if (_.isNull(viewEntityNames) || _.isUndefined(viewEntityNames) || viewEntityNames.length === 0) {
        throw new Error('ViewEntityContainer expects viewEntityNames to exist');
      } else {
        _.each(viewEntityNames, function(viewEntityName) {
          this._ensureViewReferencesViewEntity(viewEntityName);
          this._ensureViewEntityUnattached(viewEntityName);
        }, this);
      }
    },

    // Make sure the model is a property of the view.
    _ensureViewReferencesViewEntity: function(viewEntityName) {
      var viewEntity = this.view[viewEntityName];

      if (_.isNull(viewEntity) || _.isUndefined(viewEntity)) {
        throw new Error('ViewEntityContainer expects viewEntity ' + viewEntityName + ' to be a property of the view');
      }
    },

    // Make sure the model is not already attached to another view.
    _ensureViewEntityUnattached: function(viewEntityName) {
      var viewEntity = this.view[viewEntityName];

      if (viewEntity._attachedToView) {
        throw new Error('ViewEntity ' + viewEntityName + ' is already attached to a view.');
      }
    },

    // Mark each model attached
    _attachViewEntitys: function(viewEntityNames) {
      _.each(viewEntityNames, function(viewEntityName) {
        this.view[viewEntityName]._attachedToView = true;
      }, this);
    },

    // Force each model to unbind its event listeners and mark itself unattached.
    _cleanupViewEntitys: function(viewEntityNames) {
      _.each(viewEntityNames, this._cleanupViewEntity.bind(this));
    },

    _cleanupViewEntity: function(viewEntityName) {
      // Make sure the view didn't trash its reference to the model during its lifetime.
      this._ensureViewReferencesViewEntity(viewEntityName);
      var viewEntity = this.view[viewEntityName];
      viewEntity.stopListening();
      delete viewEntity._attachedToView;
    }
  });

  return ViewEntityContainer;
});