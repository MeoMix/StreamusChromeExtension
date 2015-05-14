define(function(require) {
    'use strict';

    var Tooltipable = require('foreground/view/behavior/tooltipable');
    var SaveStreamButtonTemplate = require('text!template/stream/saveStreamButton.html');
    var SaveIconTemplate = require('text!template/icon/saveIcon_18.svg');

    var SaveStreamButtonView = Marionette.ItemView.extend({
        id: 'saveStreamButton',
        className: 'button button--icon button--icon--secondary button--medium js-tooltipable',
        template: _.template(SaveStreamButtonTemplate),
        templateHelpers: {
            saveIcon: _.template(SaveIconTemplate)()
        },

        events: {
            'click': '_onClick',
        },

        modelEvents: {
            'change:enabled': '_onChangeEnabled'
        },

        behaviors: {
            Tooltipable: {
                behaviorClass: Tooltipable
            }
        },

        onRender: function() {
            this._setState(this.model.get('enabled'), this.model.getStateMessage());
        },

        _onClick: function() {
            if (this.model.get('enabled')) {
                this._showSaveSongsSimpleMenu(this.model.get('streamItems').pluck('song'));
            }
        },

        _onChangeEnabled: function(model, enabled) {
            this._setState(enabled, model.getStateMessage());
        },

        _setState: function(enabled, stateMessage) {
            this.$el.toggleClass('is-disabled', !enabled).attr('data-tooltip-text', stateMessage);
        },

        _showSaveSongsSimpleMenu: function(songs) {
            var offset = this.$el.offset();

            Streamus.channels.saveSongs.commands.trigger('show:simpleMenu', {
                songs: songs,
                top: offset.top,
                left: offset.left
            });
        }
    });

    return SaveStreamButtonView;
});