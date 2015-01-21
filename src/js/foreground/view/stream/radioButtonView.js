define(function (require) {
    'use strict';

    var Tooltip = require('foreground/view/behavior/tooltip');
    var RadioButtonTemplate = require('text!template/stream/radioButton.html');

    var RadioButtonView = Marionette.ItemView.extend({
        id: 'radioButton',
        className: 'button button--icon button--icon--secondary button--medium js-tooltipable',
        template: _.template(RadioButtonTemplate),

        events: {
            'click': '_onClick'
        },

        modelEvents: {
            'change:enabled': '_onChangeEnabled'
        },

        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },

        onRender: function () {
            this._setState(this.model.get('enabled'), this.model.getStateMessage());
        },

        _onClick: function () {
            this.model.toggleEnabled();
        },

        _onChangeEnabled: function (model, enabled) {
            this._setState(enabled, model.getStateMessage());
        },

        _setState: function (enabled, stateMessage) {
            this.$el.toggleClass('is-enabled', enabled).attr('title', stateMessage);
        }
    });

    return RadioButtonView;
});