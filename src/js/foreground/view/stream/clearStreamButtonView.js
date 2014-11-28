define([
    'foreground/view/behavior/tooltip',
    'foreground/view/prompt/clearStreamPromptView',
    'text!template/stream/clearStreamButton.html'
], function (Tooltip, ClearStreamPromptView, ClearStreamButtonTemplate) {
    'use strict';

    var ClearStreamButtonView = Marionette.ItemView.extend({
        tagName: 'button',
        id: 'clearStreamButton',
        className: 'button--icon button--icon--secondary button--medium js-tooltipable',
        template: _.template(ClearStreamButtonTemplate),
        
        events: {
            'click': '_onClick',
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
            if (this.model.get('enabled')) {
                this._showClearStreamPrompt();
            }
        },
        
        _onChangeEnabled: function (model, enabled) {
            this._setState(enabled, model.getStateMessage());
        },
        
        _setState: function (enabled, stateMessage) {
            this.$el.toggleClass('disabled', !enabled).attr('title', stateMessage);
        },
        
        _showClearStreamPrompt: function () {
            Streamus.channels.prompt.commands.trigger('show:prompt', ClearStreamPromptView);
        }
    });

    return ClearStreamButtonView;
});