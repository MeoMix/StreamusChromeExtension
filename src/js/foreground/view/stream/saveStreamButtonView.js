define([
    'foreground/view/behavior/tooltip',
    'text!template/stream/saveStreamButton.html'
], function (Tooltip, SaveStreamButtonTemplate) {
    'use strict';

    var SaveStreamButtonView = Marionette.ItemView.extend({
        id: 'saveStreamButton',
        className: 'button button--icon button--icon--secondary button--medium js-tooltipable',
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
            //  Defer the click event because showing a simpleMenu while a click event is mid-propagation will cause the simpleMenu to close immediately.
            _.defer(function () {
                var offset = this.$el.offset();

                Streamus.channels.saveSongs.commands.trigger('show:simpleMenu', {
                    //  TODO: Weird coupling.
                    playlists: Streamus.backgroundPage.signInManager.get('signedInUser').get('playlists'),
                    songs: songs,
                    top: offset.top,
                    left: offset.left
                });
            }.bind(this));
        }
    });

    return SaveStreamButtonView;
});