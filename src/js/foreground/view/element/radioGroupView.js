define(function(require) {
    'use strict';

    var RadioButtonView = require('foreground/view/element/radioButtonView');
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
            buttons: '.radio-buttons'
        },

        events: {
            'keydown': '_onKeyDown'
        },

        _onKeyDown: function(event) {
            if (event.keyCode === 37 || event.keyCode === 38) {
                this.collection.checkPrevious();
            } else if (event.keyCode === 39 || event.keyCode === 40) {
                this.collection.checkNext();
            }
        }
    });

    return RadioGroupView;
});