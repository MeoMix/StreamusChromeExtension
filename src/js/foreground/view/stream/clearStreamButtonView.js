﻿define(function (require) {
    'use strict';

    var Tooltip = require('foreground/view/behavior/tooltip');
    var ClearStreamDialogView = require('foreground/view/dialog/clearStreamDialogView');
    var ClearStreamButtonTemplate = require('text!template/stream/clearStreamButton.html');

    var ClearStreamButtonView = Marionette.ItemView.extend({
        id: 'clearStreamButton',
        className: 'button button--icon button--icon--secondary button--medium js-tooltipable',
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
                this._showClearStreamDialog();
            }
        },
        
        _onChangeEnabled: function (model, enabled) {
            this._setState(enabled, model.getStateMessage());
        },
        
        _setState: function (enabled, stateMessage) {
            this.$el.toggleClass('disabled', !enabled).attr('title', stateMessage);
        },
        
        _showClearStreamDialog: function () {
            var streamItems = this.model.get('streamItems');

            //  When deleting only a single StreamItem it is not necessary to show a dialog because it's not a very dangerous action.
            if (streamItems.length === 1) {
                streamItems.clear();
            } else {
                Streamus.channels.dialog.commands.trigger('show:dialog', ClearStreamDialogView);
            }
        }
    });

    return ClearStreamButtonView;
});