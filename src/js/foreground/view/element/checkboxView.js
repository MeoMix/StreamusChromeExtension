define([
    'common/enum/checkboxState',
    'text!template/element/checkbox.html'
], function (CheckboxState, CheckboxTemplate) {
    'use strict';

    var CheckboxView = Marionette.ItemView.extend({
        tagName: 'checkbox',
        className: function () {
            return this.model.get('primary') ? 'primary' : 'secondary';
        },
        template: _.template(CheckboxTemplate),
        
        ui: {
            icon: '.checkbox-icon'
        },
        
        events: {
            'click': '_onClick',
            'webkitTransitionEnd @ui.icon': '_onIconWebkitTransitionEnd'
        },
        
        modelEvents: {
            'change:checked': '_onChangeChecked'
        },
        
        onRender: function () {
            var checked = this.model.get('checked');
            this._setCheckedState(checked);
            this._setIconState(checked);
        },
        
        _onIconWebkitTransitionEnd: function (event) {
            //  TODO: I am transitioning >1 property but am only interested in running this code once.
            //  There are many ways to handle this issue -- I could unbind/rebind event handlers, throttle this function, or check for an expected propertyName.
            //  I wonder which way would be most robust? I'm opposed to throttling because if the transition duration becomes too short then my throttle would conflict.
            //  I'm opposed to checking propertyName because it is fragily coupled to the CSS. I'm opposed to binding/unbinding event handlers because it's very convoluted.
            if (event.originalEvent.propertyName === 'width') {
                this.model.advanceState();
                this._setIconState(this.model.get('checked'));
            }
        },
        
        _onClick: function () {
            this.model.set('checked', !this.model.get('checked'));
        },
        
        _onChangeChecked: function (model, checked) {
            this.model.toggleState();
            this._setCheckedState(checked);
            this._setIconState(checked);
        },
        
        _setCheckedState: function (checked) {
            this.$el.toggleClass('is-checked', checked);
            this.$el.toggleClass('is-unchecked', !checked);
        },

        _setIconState: function (checked) {
            var isBox = !checked;
            var isCheckmark = checked;

            //  If the state of the checkbox is changed while collapsing then it should reverse direction
            //  and undo its transition instead of moving forward with its transition.
            if (this.model.get('state') === CheckboxState.Collapsing) {
                isBox = !isBox;
                isCheckmark = !isCheckmark;
            }
            
            this.ui.icon.toggleClass('box', isBox);
            this.ui.icon.toggleClass('checkmark', isCheckmark);
        }
    });

    return CheckboxView;
});