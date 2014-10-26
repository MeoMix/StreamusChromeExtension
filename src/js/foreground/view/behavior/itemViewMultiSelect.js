define(function() {
    'use strict';

    var ItemViewMultiSelect = Backbone.Marionette.Behavior.extend({
        modelEvents: {
            'change:selected': '_onModelChangeSelected'
        },

        onRender: function() {
            this.$el.addClass('js-listItem--multiSelect');
            this._setSelectedClass(this.view.model.get('selected'));
        },
        
        _onModelChangeSelected: function (model, selected) {
            this._setSelectedClass(selected);
        },

        _setSelectedClass: function (selected) {
            this.$el.toggleClass('is-selected', selected);
        }
    });

    return ItemViewMultiSelect;
});