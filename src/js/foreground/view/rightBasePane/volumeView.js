//  VolumeView represents the mute/unmute button as well as the volume slider.
//  Interacting with these controls will affect the muted state and volume of the YouTube player.
define([
    'text!template/volume.html'
], function (VolumeTemplate) {
    'use strict';

    var VolumeView = Backbone.Marionette.ItemView.extend({
        className: 'volume clickable',
        template: _.template(VolumeTemplate),
        
        ui: {
            progress: '.progress',
            volumeRange: '.volume-range',
            muteButton: '.mute',
            slidePanel: '.slide-panel'
        },

        events: {
            'input @ui.volumeRange': '_setVolume',
            'click @ui.muteButton': '_toggleMute',
            'mousewheel': '_scrollVolume'
        },
       
        modelEvents: {
            'change:muted': '_toggleMutedClass',
            'change:volume': '_updateProgressAndVolumeIcon'
        },

        onRender: function () {
            //  TODO: I don't like setting HTML like this. Just set a class and make some of the icons hidden in the template.
            var volumeIcon = this.getVolumeIcon(this.model.get('volume'));
            this.ui.muteButton.html(volumeIcon);
            this.$el.hoverIntent(this._expand.bind(this), this._collapse.bind(this));
        },
        
        _expand: function () {
            this.ui.slidePanel.addClass('expanded');
        },
        
        _collapse: function () {
            this.ui.slidePanel.removeClass('expanded');
        },

        _setVolume: function () {
            var volume = parseInt(this.ui.volumeRange.val());
            this.model.set('volume', volume);
        },

        _updateProgressAndVolumeIcon: function () {
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
        _scrollVolume: function (event) {
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

        _toggleMute: function () {
            var isMuted = this.model.get('muted');
            this.model.set('muted', !isMuted);
        },

        _toggleMutedClass: function () {
            var isMuted = this.model.get('muted');
            this.ui.muteButton.toggleClass('muted', isMuted);
        }
    });

    return VolumeView;
});