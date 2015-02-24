define(function (require) {
    'use strict';

    var Tooltip = require('foreground/view/behavior/tooltip');
    var ShuffleButtonTemplate = require('text!template/stream/shuffleButton.html');
    var ShuffleIconTemplate = require('text!template/icon/shuffleIcon_18.svg');

    var ShuffleButtonView = Marionette.ItemView.extend({
        id: 'shuffleButton',
        className: 'button button--icon button--icon--secondary button--medium js-tooltipable',
        template: _.template(ShuffleButtonTemplate),
        templateHelpers: {
            shuffleIcon: _.template(ShuffleIconTemplate)()
        },
        
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