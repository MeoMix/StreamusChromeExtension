define(function (require) {
    'use strict';

    var CheckboxTemplate = require('text!template/element/checkbox.html');

    var CheckboxView = Marionette.ItemView.extend({
        tagName: 'checkbox',
        className: function () {
            var className = this.model.get('primary') ? 'checkbox--primary' : 'checkbox--secondary';
            className += this.model.get('iconOnLeft') ? ' checkbox--leftIcon' : ' checkbox--rightIcon';
            return className;
        },
        template: _.template(CheckboxTemplate),
        
        ui: {
            icon: '.checkbox-icon'
        },

        events: {
            'click': '_onClick',
            'webkitAnimationEnd @ui.icon': '_onIconWebkitAnimationEnd'
        },
        
        modelEvents: {
            'change:checked': '_onChangeChecked'
        },
        
        onRender: function () {
            var checked = this.model.get('checked');
            this._setCheckedState(checked);
        },
        
        _onIconWebkitAnimationEnd: function () {
            //  TODO: It would be nice to not check for a class here, but when I change to use Web Animation API I'll be able to read from that instead.
            if (this.$el.hasClass('is-checking')) {
                this.$el.removeClass('is-checking');
                this.$el.addClass('is-checked');
            }
            else if (this.$el.hasClass('is-unchecking')) {
                this.$el.removeClass('is-unchecking');
                this.$el.addClass('is-unchecked');
            }
        },
        
        _onClick: function () {
            this.model.set('checked', !this.model.get('checked'));
        },
        
        _onChangeChecked: function (model, checked) {
            if (checked) {
                this.$el.addClass('is-checking').removeClass('is-unchecked is-unchecking');
            }
            else {
                this.$el.addClass('is-unchecking').removeClass('is-checked is-checking');
            }
        },
        
        _setCheckedState: function (checked) {
            this.$el.toggleClass('is-checked', checked);
            this.$el.toggleClass('is-unchecked', !checked);
        }
    });

    return CheckboxView;
});