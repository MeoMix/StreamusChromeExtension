define([
    'foreground/view/behavior/tooltip',
    'foreground/view/prompt/saveSongsPromptView',
    'text!template/rightPane/saveStreamButton.html'
], function (Tooltip, SaveSongsPromptView, SaveStreamButtonTemplate) {
    'use strict';

    var SaveStreamButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'button',
        id: 'saveStreamButton',
        className: 'button--icon button--medium js-tooltipable',
        template: _.template(SaveStreamButtonTemplate),

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

        onRender: function () {
            this._setState(this.model.get('enabled'), this.model.getStateMessage());
        },

        _onClick: function () {
            if (this.model.get('enabled')) {
                this._showSaveSongsPrompt(this.model.get('streamItems').pluck('song'));
            }
        },

        _onChangeEnabled: function (model, enabled) {
            this._setState(enabled, model.getStateMessage());
        },

        _setState: function (enabled, stateMessage) {
            this.$el.toggleClass('disabled', !enabled).attr('title', stateMessage);
        },

        _showSaveSongsPrompt: function (songs) {
            Streamus.channels.prompt.commands.trigger('show:prompt', SaveSongsPromptView, {
                songs: songs
            });
        }
    });

    return SaveStreamButtonView;
});