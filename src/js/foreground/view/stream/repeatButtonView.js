define(function(require) {
    'use strict';

    var RepeatButtonState = require('common/enum/repeatButtonState');
    var Tooltipable = require('foreground/view/behavior/tooltipable');
    var RepeatButtonTemplate = require('text!template/stream/repeatButton.html');
    var RepeatIconTemplate = require('text!template/icon/repeatIcon_18.svg');
    var RepeatOneIconTemplate = require('text!template/icon/repeatOneIcon_18.svg');

    var RepeatButtonView = Marionette.ItemView.extend({
        id: 'repeatButton',
        className: 'button button--icon button--icon--secondary button--medium js-tooltipable',
        template: _.template(RepeatButtonTemplate),

        templateHelpers: {
            repeatIcon: _.template(RepeatIconTemplate)(),
            repeatOneIcon: _.template(RepeatOneIconTemplate)()
        },

        ui: function() {
            return {
                repeatIcon: '#' + this.id + '-repeatIcon',
                repeatOneIcon: '#' + this.id + '-repeatOneIcon'
            };
        },

        events: {
            'click': '_onClick'
        },

        modelEvents: {
            'change:state': '_onChangeState'
        },

        behaviors: {
            Tooltipable: {
                behaviorClass: Tooltipable
            }
        },

        onRender: function() {
            this._setState(this.model.get('state'), this.model.getStateMessage());
        },

        _onClick: function() {
            this.model.toggleRepeatState();
        },

        _onChangeState: function(model, state) {
            this._setState(state, model.getStateMessage());
        },

        _setState: function(state, stateMessage) {
            //  The button is considered enabled if it is anything but off.
            var enabled = state !== RepeatButtonState.Off;

            this.$el.toggleClass('is-enabled', enabled).attr('data-tooltip-text', stateMessage);
            this.ui.repeatOneIcon.toggleClass('is-hidden', state !== RepeatButtonState.RepeatSong);
            this.ui.repeatIcon.toggleClass('is-hidden', state === RepeatButtonState.RepeatSong);
        },
    });

    return RepeatButtonView;
});