define([
    'foreground/view/behavior/tooltip',
    'text!template/stream/shuffleButton.html'
], function (Tooltip, ShuffleButtonTemplate) {
    'use strict';

    var ShuffleButtonView = Marionette.ItemView.extend({
        tagName: 'button',
        id: 'shuffleButton',
        className: 'button--icon button--icon--secondary button--medium js-tooltipable',
        template: _.template(ShuffleButtonTemplate),
        
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

    return ShuffleButtonView;
});