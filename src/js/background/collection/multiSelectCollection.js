define(function() {
    'use strict';

    //  TODO: How can I make this a mix-in instaad of extending Backbone.Collection as a base class?
    var MultiSelectCollection = Backbone.Collection.extend({
        initialize: function() {
            this.on('change:selected', this._onChangeSelected);
            this.on('change:firstSelected', this._onChangeFirstSelected);
        },

        //  Just a nicer naming for deselectAll
        deselectAll: function() {
            this.deselectAllExcept(null);
        },

        //  This takes cid not id because it works for models which aren't persisted to the server.
        deselectAllExcept: function(selectedModel) {
            var selected = this.selected();
            
            _.each(selected, function (model) {
                if (model !== selectedModel) {
                    model.set('selected', false);
                }
            });
        },

        //  Return a list of selected models.
        selected: function() {
            return this.where({ selected: true });
        },

        //  Returns the model which was first selected (or selected last if ctrl was pressed)
        firstSelected: function() {
            return this.findWhere({ firstSelected: true });
        },
        
        _onChangeSelected: function(model, selected) {
            //  Whenever only one model is selected -- it becomes the first one to be selected.
            var selectedModels = this.selected();
                
            if (selectedModels.length === 1) {
                selectedModels[0].set('firstSelected', true);
            }

            //  A model which is no longer selected can't be the first selected model.
            if (!selected) {
                model.set('firstSelected', false);
            }
        },

        //  Ensure that only 1 item is ever first selected.
        _onChangeFirstSelected: function(changedModel, firstSelected) {
            if (firstSelected) {
                this.each(function (model) {
                    if (model !== changedModel && model.get('firstSelected')) {
                        model.set('firstSelected', false);
                    }
                });
            }
        }
    });

    return MultiSelectCollection;
});