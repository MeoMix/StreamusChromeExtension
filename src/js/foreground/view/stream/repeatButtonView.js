﻿define(function (require) {
    'use strict';

    var RepeatButtonState = require('common/enum/repeatButtonState');
    var Tooltip = require('foreground/view/behavior/tooltip');
    var RepeatButtonTemplate = require('text!template/stream/repeatButton.html');

    var RepeatButtonView = Marionette.ItemView.extend({
        id: 'repeatButton',
        className: 'button button--icon button--icon--secondary button--medium js-tooltipable',
        template: _.template(RepeatButtonTemplate),
        
        ui: function () {
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
            Tooltip: {
                behaviorClass: Tooltip
            }
        },

        onRender: function () {
            this._setState(this.model.get('state'), this.model.getStateMessage());
        },
        
        _onClick: function () {
            this.model.toggleRepeatState();
        },
        
        _onChangeState: function(model, state) {
            this._setState(state, model.getStateMessage());
        },
        
        _setState: function (state, stateMessage) {
            //  The button is considered enabled if it is anything but disabled.
            var enabled = state !== RepeatButtonState.Disabled;

            this.$el.toggleClass('is-enabled', enabled).attr('title', stateMessage);
            
            //  TODO: SVG element and JQuery don't work well together.
            this.ui.repeatOneIcon[0].classList.toggle('hidden', state !== RepeatButtonState.RepeatSong);
            this.ui.repeatIcon[0].classList.toggle('hidden', state === RepeatButtonState.RepeatSong);
        },
    });

    return RepeatButtonView;
});