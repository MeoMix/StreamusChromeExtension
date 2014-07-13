//  VolumeView represents the mute/unmute button as well as the volume slider.
//  Interacting with these controls will affect the muted state and volume of the YouTube player.
define([
    'text!template/volume.html'
], function (VolumeTemplate) {
    'use strict';

    var VolumeView = Backbone.Marionette.ItemView.extend({
        id: 'volume',
        template: _.template(VolumeTemplate),
        
        ui: {
            volumeSlider: '.volume-slider',
            //  Progress is the shading filler for the volumeRange's value.
            progress: '.progress',
            volumeRange: 'input.volume-range',
            muteButton: '#mute-button'
        },

        events: {
            'input @ui.volumeRange': 'setVolume',
            'click @ui.muteButton': 'toggleMute',
            'mousewheel': 'scrollVolume'
        },
       
        modelEvents: {
            'change:muted': 'toggleMutedClass',
            'change:volume': 'updateProgressAndVolumeIcon'
        },

        onRender: function () {
            var volumeIcon = this.getVolumeIcon(this.model.get('volume'));
            this.ui.muteButton.html(volumeIcon);
            
            this.$el.hoverIntent(this._expand.bind(this), this._collapse.bind(this), {
                sensitivity: 2,
                interval: 5500,
            });
        },
        
        _expand: function() {
            this.$el.data('oldheight', this.$el.height()).transition({
                height: 150
            }, 250, 'snap');

            this.ui.volumeSlider.transition({
                opacity: 1
            }, 250, 'snap');
        },
        
        _collapse: function() {
            this.$el.transition({
                height: this.$el.data('oldheight')
            }, 250);

            this.ui.volumeSlider.transition({
                opacity: 0
            }, 250);
        },

        setVolume: function () {
            var volume = parseInt(this.ui.volumeRange.val());
            this.model.set('volume', volume);
        },

        updateProgressAndVolumeIcon: function () {
            var volume = parseInt(this.model.get('volume'));

            this.ui.volumeRange.val(volume);
            this.ui.progress.height(volume + '%');

            var volumeIcon = this.getVolumeIcon(volume);
            this.ui.muteButton.html(volumeIcon);
        },

        //  Return whichever font-awesome icon is appropriate based on the current volume level.
        getVolumeIcon: function (volume) {
            var volumeIconClass = 'off';

            if (volume > 50) {
                volumeIconClass = 'up';
            }
            else if (volume > 0) {
                volumeIconClass = 'down';
            }

            var volumeIcon = $('<i>', {
                'class': 'fa fa-volume-' + volumeIconClass
            });

            return volumeIcon;
        },

        //  Adjust volume when user scrolls mousewheel while hovering over volume.
        scrollVolume: function (event) {
            var delta = event.originalEvent.wheelDeltaY / 120;
            var volume = parseInt(this.ui.volumeRange.val()) + (delta * 3);

            if (volume > 100) {
                volume = 100;
            }

            if (volume < 0) {
                volume = 0;
            }

            this.model.set('volume', volume);
        },

        toggleMute: function () {
            var isMuted = this.model.get('muted');
            this.model.set('muted', !isMuted);
        },

        toggleMutedClass: function () {
            var isMuted = this.model.get('muted');
            this.ui.muteButton.toggleClass('muted', isMuted);
        }
    });

    return VolumeView;
});