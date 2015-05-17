define(function(require) {
    'use strict';

    var RadioButtonView = require('foreground/view/element/radioButtonView');
    var KeyCode = require('foreground/enum/keyCode');
    var RadioGroupTemplate = require('text!template/element/radioGroup.html');

    var RadioGroupView = Marionette.CompositeView.extend({
        tagName: 'radio-group',
        template: _.template(RadioGroupTemplate),
        childViewContainer: '@ui.buttons',
        childView: RadioButtonView,

        attributes: {
            tabIndex: 0
        },

        ui: {
            buttons: '[data-ui~=buttons]'
        },

        events: {
            'keydown': '_onKeyDown'
        },

        _onKeyDown: function(event) {
            if (event.keyCode === KeyCode.ArrowLeft || event.keyCode === KeyCode.ArrowUp) {
                this.collection.checkPrevious();
            } else if (event.keyCode === KeyCode.ArrowRight || event.keyCode === KeyCode.ArrowDown) {
                this.collection.checkNext();
            }
        }
    });

    return RadioGroupView;
});