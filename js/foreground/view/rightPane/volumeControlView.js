//  VolumeControlView represents the mute/unmute button as well as the volume slider.
//  Interacting with these controls will affect the muted state and volume of the YouTube player.
define([
    'text!../template/volumeControl.htm',
    'player'
], function (VolumeControlTemplate, Player) {
    'use strict';

    var VolumeControlView = Backbone.View.extend({
        
        className: 'volumeControl',

        template: _.template(VolumeControlTemplate),
        
        events: {
            'change input.volumeRange': 'setVolume',
            'click button.mute': 'toggleMute',
            'mousewheel': 'scrollVolume'
        },
        
        volumeSlider: null,
        progress: null,
        volumeRange: null,
        muteButton: null,
        
        render: function () {

            var volume = Player.get('volume');
            var muted = Player.get('muted');

            //  Instead of generating a template from a model, mix in just a couple of properties.
            this.$el.html(this.template({
                'chrome.i18n': chrome.i18n,
                'volume': volume,
                'muted': muted
            }));

            //  Store references to child elements after rendering for ease of use.
            //  Progress is the shading filler for the volumeRange's value.
            this.volumeSlider = this.$el.children('.volume-slider');
            this.progress = this.volumeSlider.children('.progress');
            this.volumeRange = this.volumeSlider.children('input.volumeRange');
            this.muteButton = this.$el.children('button.mute');
            
            var volumeIcon = this.getVolumeIcon(volume);
            this.muteButton.html(volumeIcon);

            return this;
        },

        initialize: function () {
            this.listenTo(Player, 'change:muted', this.render);
            this.listenTo(Player, 'change:volume', this.updateProgressAndVolumeIcon);

            var self = this;
            this.$el.hover(function () {

                $(this).transition({ height: 152 }, 200);
                self.volumeSlider.transition({ opacity: 1, marginTop: 0 }, 200);
                
            }, function () {

                $(this).transition({ height: 36 }, 200);
                self.volumeSlider.transition({ opacity: 0, marginTop: -20 }, 200);
            });

        },
        
        setVolume: function () {
            var volume = parseInt(this.volumeRange.val());
            Player.set('volume', volume);
        },
        
        //  Need to do this here and not in render to be able to support dragging the volume slider
        //  If render is called (and reset the HTML entirely) the drag operation is broken and the slider stutters.
        updateProgressAndVolumeIcon: function () {

            var volume = parseInt(Player.get('volume'));

            this.volumeRange.val(volume);
            this.progress.height(volume + '%');

            var volumeIcon = this.getVolumeIcon(volume);
            this.muteButton.html(volumeIcon);
        },
        
        //  Return whichever font-awesome icon is appropriate based on the current volume level.
        getVolumeIcon: function(volume) {
            var volumeIconClass = 'off';

            if (volume > 50) {
                volumeIconClass = 'up';
            }
            else if (volume > 0) {
                volumeIconClass = 'down';
            }

            var volumeIcon = $('<i>', {
                'class': 'icon-volume-' + volumeIconClass
            });
            
            return volumeIcon;
        },

        //  Adjust volume when user scrolls mousewheel while hovering over volumeControl.
        scrollVolume: function (event) {
            var delta = event.originalEvent.wheelDeltaY / -120;
            var volume = parseInt(this.volumeRange.val()) + (delta * 3);
            
            if (volume > 100) {
                volume = 100;
            }
            
            if (volume < 0) {
                volume = 0;
            }
            
            Player.set('volume', volume);
        },
        
        toggleMute: function () {
            var isMuted = Player.get('muted');
            Player.set('muted', !isMuted);
        }

    });

    return VolumeControlView;
})