define(function() {
    'use strict';

    var ItemViewMultiSelect = Backbone.Marionette.Behavior.extend({
        modelEvents: {
            'change:selected': '_setSelectedClass'
        },

        onRender: function () {
            this.$el.addClass('js-listItem--multiSelect');

            this._setSelectedClass();
        },

        _setSelectedClass: function () {
            this.$el.toggleClass('is-selected', this.view.model.get('selected'));
        }
    });

    return ItemViewMultiSelect;
})