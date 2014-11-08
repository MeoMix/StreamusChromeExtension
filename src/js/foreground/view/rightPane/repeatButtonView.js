define([
    'common/enum/repeatButtonState',
    'foreground/view/behavior/tooltip',
    'text!template/rightPane/repeatButton.html'
], function (RepeatButtonState, Tooltip, RepeatButtonTemplate) {
    'use strict';

    var RepeatButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'button',
        id: 'repeatButton',
        className: 'button--icon button--medium js-tooltipable',
        template: _.template(RepeatButtonTemplate),
        
        ui: {
            repeatIcon: '#repeatButton-repeatIcon',
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

            this.ui.repeatIcon
                .toggleClass('is-repeatOne', state === RepeatButtonState.RepeatSong)
                .toggleClass('is-repeatAll', state === RepeatButtonState.RepeatStream);
        },
    });

    return RepeatButtonView;
});