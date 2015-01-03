define([
    'foreground/model/simpleMenuItem'
], function (SimpleMenuItem) {
    'use strict';

    var SimpleMenuItems = Backbone.Collection.extend({
        model: SimpleMenuItem,
        
        initialize: function() {
            this.on('change:selected', this._onChangeSelected);
        },
        
        getSelected: function() {
            return this.findWhere({ selected: true });
        },
        
        //  Enforce that only one model can be selected at a time by deselecting all other models when one becomes selected.
        _onChangeSelected: function(model, selected) {
            if (selected) {
                this._deselectAllExcept(model);
            }
        },
        
        _deselectAllExcept: function (selectedModel) {
            var selectedModels = this._getSelectedList();

            _.each(selectedModels, function (model) {
                if (model !== selectedModel) {
                    model.set('selected', false);
                }
            });
        },
        
        _getSelectedList: function () {
            return this.where({ selected: true });
        }
    });

    return SimpleMenuItems;
});