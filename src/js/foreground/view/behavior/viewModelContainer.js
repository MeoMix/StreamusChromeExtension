define(function() {
    'use strict';

    var ViewModelContainer = Marionette.Behavior.extend({
        viewModelNames: null,

        initialize: function(options) {
            this.viewModelNames = options.viewModelNames || [];
        },

        onRender: function() {
            this._ensureViewModels(this.viewModelNames);
        },

        onBeforeDestroy: function() {
            this._cleanupViewModels(this.viewModelNames);
        },

        _ensureViewModels: function(viewModelNames) {
            if (viewModelNames === null || _.isUndefined(viewModelNames) || viewModelNames.length === 0) {
                throw new Error('ViewModelContainer expects viewModelNames to exist');
            } else {
                _.each(viewModelNames, function(viewModelName) {
                    this._ensureViewReferencesViewModel(viewModelName);
                    this._ensureViewModelUnattached(viewModelName);

                    this.view[viewModelName]._attachedToView = true;
                }, this);
            }
        },

        _ensureViewReferencesViewModel: function(viewModelName) {
            var viewModel = this.view[viewModelName];

            if (viewModel === null || _.isUndefined(viewModel)) {
                throw new Error('ViewModelContainer expects viewModel ' + viewModelName + ' to be a property of the view');
            }
        },

        _ensureViewModelUnattached: function(viewModelName) {
            var viewModel = this.view[viewModelName];

            if (viewModel._attachedToView) {
                throw new Error('ViewModel ' + viewModelName + ' is already attached to a view.');
            }
        },

        _cleanupViewModels: function(viewModelNames) {
            _.each(viewModelNames, this._cleanupViewModel.bind(this));
        },

        _cleanupViewModel: function(viewModelName) {
            this._ensureViewReferencesViewModel(viewModelName);
            var viewModel = this.view[viewModelName];
            viewModel.stopListening();
            delete viewModel._attachedToView;
        }
    });

    return ViewModelContainer;
});