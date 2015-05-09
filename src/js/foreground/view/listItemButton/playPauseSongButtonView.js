define(function(require) {
    'use strict';

    var ListItemButtonView = require('foreground/view/listItemButton/listItemButtonView');
    var PlayPauseSongButtonTemplate = require('text!template/listItemButton/playPauseSongButton.html');
    var PlayIconTemplate = require('text!template/icon/playIcon_18.svg');
    var PauseIconTemplate = require('text!template/icon/pauseIcon_18.svg');
    var PlayerState = require('common/enum/playerState');

    var PlayPauseSongButtonView = ListItemButtonView.extend({
        template: _.template(PlayPauseSongButtonTemplate),
        templateHelpers: {
            playIcon: _.template(PlayIconTemplate)(),
            pauseIcon: _.template(PauseIconTemplate)()
        },

        attributes: {
            title: chrome.i18n.getMessage('play')
        },

        ui: function() {
            return {
                playIcon: '.playIcon',
                pauseIcon: '.pauseIcon'
            };
        },

        streamItems: null,
        player: null,

        initialize: function() {
            this.streamItems = Streamus.backgroundPage.stream.get('items');
            this.player = Streamus.backgroundPage.player;

            this.listenTo(this.player, 'change:state', this._onPlayerChangeState);
            this.listenTo(this.streamItems, 'change:active', this._onStreamItemsChangeActive);

            ListItemButtonView.prototype.initialize.apply(this, arguments);
        },

        onRender: function() {
            this._setState();
        },

        doOnClickAction: function() {
            var isPausable = this._isPausable();

            if (isPausable) {
                this.player.pause();
            } else {
                this._playSong();
            }
        },

        _onPlayerChangeState: function() {
            this._setState();
        },

        _onStreamItemsChangeActive: function() {
            this._setState();
        },

        _setState: function() {
            var isPausable = this._isPausable();

            //  TODO: There's a difference between buffering-->play and buffering-->paused. Don't want to change button when buffering-->paused. How to tell the difference?
            this.ui.pauseIcon.toggleClass('is-hidden', !isPausable);
            this.ui.playIcon.toggleClass('is-hidden', isPausable);
        },

        _isPausable: function() {
            var activeSongId = this.streamItems.getActiveSongId();
            //  The pause icon is visible only if the player is playing/buffering and the song is this model's song.
            var songId = this.model.get('song').get('id');
            var isPlayerPausable = this.player.isPausable();
            var isPausable = activeSongId === songId && isPlayerPausable;

            return isPausable;
        },

        _playSong: function() {
            var song = this.model.get('song');

            //  If there's only one song to be played - check if it's already in the stream.
            var streamItem = this.streamItems.getBySong(song);

            if (_.isUndefined(streamItem)) {
                this.streamItems.addSongs(song, {
                    playOnAdd: true
                });
            } else {
                this._playStreamItem(streamItem);
            }
        },

        _playStreamItem: function(streamItem) {
            if (streamItem.get('active')) {
                this.player.play();
            } else {
                this.player.set('playOnActivate', true);
                streamItem.save({ active: true });
            }
        }
    });

    return PlayPauseSongButtonView;
});