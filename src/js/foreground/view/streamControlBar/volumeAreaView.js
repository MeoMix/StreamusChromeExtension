import {LayoutView} from 'marionette';
import VolumeAreaTemplate from 'template/streamControlBar/volumeArea.hbs!';
import VolumeUpIconTemplate from 'template/icon/volumeUpIcon_24.hbs!';
import VolumeDownIconTemplate from 'template/icon/volumeDownIcon_24.hbs!';
import VolumeOffIconTemplate from 'template/icon/volumeOffIcon_24.hbs!';
import VolumeMuteIconTemplate from 'template/icon/volumeMuteIcon_24.hbs!';

var VolumeAreaView = LayoutView.extend({
  id: 'volumeArea',
  className: 'volumeArea',
  template: VolumeAreaTemplate,

  templateHelpers: function() {
    return {
      volumeUpIcon: VolumeUpIconTemplate,
      volumeDownIcon: VolumeDownIconTemplate,
      volumeOffIcon: VolumeOffIconTemplate,
      volumeMuteIcon: VolumeMuteIconTemplate
    };
  },

  ui: {
    volumeSlider: 'volumeSlider',
    volumeButton: 'volumeButton',
    volumeIconUp: 'volumeIcon--up',
    volumeIconDown: 'volumeIcon--down',
    volumeIconOff: 'volumeIcon--off',
    volumeIconMute: 'volumeIcon--mute'
  },

  events: {
    'input @ui.volumeSlider': '_onInputVolumeSlider',
    'click @ui.volumeButton': '_onClickVolumeButton'
  },

  player: null,

  initialize: function(options) {
    this.player = options.player;

    this.listenTo(this.player, 'change:muted', this._onPlayerChangeMuted);
    this.listenTo(this.player, 'change:volume', this._onPlayerChangeVolume);
  },

  onRender: function() {
    var volume = this.player.get('volume');
    var muted = this.player.get('muted');
    this._setVolumeIcon(volume, muted);
    this._setVolumeProgress(volume);
  },

  _onInputVolumeSlider: function(event, volume) {
    this.player.setVolume(volume);
  },

  _onClickVolumeButton: function() {
    this._toggleMute();
  },

  _setVolumeProgress: function(volume) {
    this.ui.volumeSlider.val(volume);
  },

  _setVolumeIcon: function(volume, muted) {
    this.ui.volumeIconUp.toggleClass('is-hidden', muted || volume <= 50);
    this.ui.volumeIconDown.toggleClass('is-hidden', muted || volume > 50 || volume === 0);
    this.ui.volumeIconOff.toggleClass('is-hidden', muted || volume !== 0);
    this.ui.volumeIconMute.toggleClass('is-hidden', !muted);
  },

  _toggleMute: function() {
    var isMuted = this.player.get('muted');
    this.player.save({
      muted: !isMuted
    });
  },

  _onPlayerChangeVolume: function(model, volume) {
    this._setVolumeProgress(volume);
    this._setVolumeIcon(volume, model.get('muted'));
  },

  _onPlayerChangeMuted: function(model, muted) {
    this._setVolumeIcon(model.get('volume'), muted);
  }
});

export default VolumeAreaView;