define(function() {
  'use strict';

  // Provides event handler unbinding of models given to the implementing view.
  // If a view's model has bound event listeners and the view is destroyed then those event listeners
  // become a memory leak if no references to the model remain.
  // If a model's lifetime is scoped to its view then it can safely bind event listeners if the view implements this Behavior.
  // Example:
  // ViewModelContainer: {
  //   behaviorClass: ViewModelContainer,
  //   viewModelNames: ['model']
  // }
  var ViewModelContainer = Marionette.Behavior.extend({
    viewModelNames: null,

    initialize: function(options) {
      // An array of property names which reference models known to the view.
      this.viewModelNames = options.viewModelNames || [];
    },

    onRender: function() {
      this._ensureViewModels(this.viewModelNames);
    },

    onBeforeDestroy: function() {
      this._cleanupViewModels(this.viewModelNames);
    },

    // Ensure that the models declared as targets are valid.
    // They must exist and they must not be attached to another view. The reason for the view check is because
    // if a model is attached to two views and one view is destroyed while the other remains then the second view will be in a broken state
    // due to its model not responding to events.
    _ensureViewModels: function(viewModelNames) {
      if (_.isNull(viewModelNames) || _.isUndefined(viewModelNames) || viewModelNames.length === 0) {
        throw new Error('ViewModelContainer expects viewModelNames to exist');
      } else {
        _.each(viewModelNames, function(viewModelName) {
          this._ensureViewReferencesViewModel(viewModelName);
          this._ensureViewModelUnattached(viewModelName);
        }, this);
      }
    },

    // Make sure the model is a property of the view.
    _ensureViewReferencesViewModel: function(viewModelName) {
      var viewModel = this.view[viewModelName];

      if (_.isNull(viewModel) || _.isUndefined(viewModel)) {
        throw new Error('ViewModelContainer expects viewModel ' + viewModelName + ' to be a property of the view');
      }
    },

    // Make sure the model is not already attached to another view.
    _ensureViewModelUnattached: function(viewModelName) {
      var viewModel = this.view[viewModelName];

      if (viewModel._attachedToView) {
        throw new Error('ViewModel ' + viewModelName + ' is already attached to a view.');
      }
    },

    // Mark each model attached
    _attachViewModels: function(viewModelNames) {
      _.each(viewModelNames, function(viewModelName) {
        this.view[viewModelName]._attachedToView = true;
      }, this);
    },

    // Force each model to unbind its event listeners and mark itself unattached.
    _cleanupViewModels: function(viewModelNames) {
      _.each(viewModelNames, this._cleanupViewModel.bind(this));
    },

    _cleanupViewModel: function(viewModelName) {
      // Make sure the view didn't trash its reference to the model during its lifetime.
      this._ensureViewReferencesViewModel(viewModelName);
      var viewModel = this.view[viewModelName];
      viewModel.stopListening();
      delete viewModel._attachedToView;
    }
  });

  return ViewModelContainer;
});