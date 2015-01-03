define([
    'text!template/element/radioButton.html'
], function (RadioButtonTemplate) {
    'use strict';

    //  TODO: Naming conflict with stream/radioButtonView
    var RadioButtonView = Marionette.ItemView.extend({
        tagName: 'radio-button',
        template: _.template(RadioButtonTemplate),
        
        events: {
            'click': '_onClick'
        },
        
        modelEvents: {
            'change:checked': '_onChangeChecked'
        },

        onRender: function() {
            this._setCheckedState(this.model.get('checked'));
        },
        
        _onClick: function () {
            this.model.set('checked', true);
        },
        
        _onChangeChecked: function (model, checked) {
            this._setCheckedState(checked);
        },

        _setCheckedState: function (checked) {
            this.$el.toggleClass('is-checked', checked);
            this.$el.toggleClass('is-unchecked', !checked);
        }
    });

    return RadioButtonView;
});