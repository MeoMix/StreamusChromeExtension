﻿define(function (require) {
    'use strict';

    var SwitchTemplate = require('text!template/element/switch.html');

    //  TODO: I could probably extract some of the logic of Switch, Radio and Checkbox out into a behavior.
    var SwitchView = Marionette.ItemView.extend({
        tagName: 'switch',
        template: _.template(SwitchTemplate),
        
        ui: {
            icon: '.switch-icon'
        },
        
        events: {
            'click': '_onClick'
        },
        
        modelEvents: {
            'change:checked': '_onChangeChecked'
        },
        
        onRender: function () {
            var checked = this.model.get('checked');
            this._setCheckedState(checked);
        },
        
        _onClick: function () {
            this.model.set('checked', !this.model.get('checked'));
        },
        
        _onChangeChecked: function(model, checked) {
            this._setCheckedState(checked);
        },
        
        _setCheckedState: function (checked) {
            this.$el.toggleClass('is-checked', checked);
            this.$el.toggleClass('is-unchecked', !checked);
            this.ui.icon.toggleClass('is-checked', checked);
            this.ui.icon.toggleClass('is-unchecked', !checked);
        }
    });

    return SwitchView;
});