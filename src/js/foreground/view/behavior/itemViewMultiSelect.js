define(function() {
    'use strict';

    var ItemViewMultiSelect = Backbone.Marionette.Behavior.extend({
        modelEvents: {
            'change:selected': '_onChangeSelected'
        },

        onRender: function() {
            this.$el.addClass('js-listItem--multiSelect');
            this._setSelectedClass(this.view.model.get('selected'));
        },
        
        _onChangeSelected: function (model, selected) {
            this._setSelectedClass(selected);
        },

        _setSelectedClass: function (selected) {
            this.$el.toggleClass('is-selected', selected);
        }
    });

    return ItemViewMultiSelect;
});