define([
    'foreground/view/behavior/tooltip',
    'text!template/rightPane/radioButton.html'
], function(Tooltip, RadioButtonTemplate) {
    'use strict';

    var RadioButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'button',
        id: 'radioButton',
        className: 'button--icon button--medium js-tooltipable',
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
        
        onRender: function() {
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
})