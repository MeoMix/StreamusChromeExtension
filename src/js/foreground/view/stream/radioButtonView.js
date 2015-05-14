define(function(require) {
    'use strict';

    var Tooltipable = require('foreground/view/behavior/tooltipable');
    var RadioButtonTemplate = require('text!template/stream/radioButton.html');
    var RadioIconTemplate = require('text!template/icon/radioIcon_18.svg');

    var RadioButtonView = Marionette.ItemView.extend({
        id: 'radioButton',
        className: 'button button--icon button--icon--secondary button--medium js-tooltipable',
        template: _.template(RadioButtonTemplate),
        templateHelpers: {
            radioIcon: _.template(RadioIconTemplate)()
        },

        events: {
            'click': '_onClick'
        },

        modelEvents: {
            'change:enabled': '_onChangeEnabled'
        },

        behaviors: {
            Tooltipable: {
                behaviorClass: Tooltipable
            }
        },

        onRender: function() {
            this._setState(this.model.get('enabled'), this.model.getStateMessage());
        },

        _onClick: function() {
            this.model.toggleEnabled();
        },

        _onChangeEnabled: function(model, enabled) {
            this._setState(enabled, model.getStateMessage());
        },

        _setState: function(enabled, stateMessage) {
            this.$el.toggleClass('is-enabled', enabled).attr('data-tooltip-text', stateMessage);
        }
    });

    return RadioButtonView;
});