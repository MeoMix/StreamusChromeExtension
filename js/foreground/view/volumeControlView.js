//  Responsible for controlling the volume indicator of the UI.
define([
    'player'
], function (Player) {
    'use strict';

    var VolumeControlView = Backbone.View.extend({
        el: $('#VolumeControl'),

        events: {
            'change #VolumeSlider': 'setVolume',
            'click #MuteButton': 'toggleMute',
            'mousewheel': 'scrollVolume',
            'mouseenter .volumeControl': 'expand',
            'mouseleave': 'contract'
        },
        
        volumeSliderWapper: $('#VolumeSliderWrapper'),
        volumeSlider: $('#VolumeSlider'),
        muteButton: $('#MuteButton'),

        render: function () {
            var volume = Player.get('volume');

            //  Repaint the amount of white filled in the bar showing the distance the grabber has been dragged.
            var backgroundImage = '-webkit-gradient(linear,left top, right top, from(#ccc), color-stop(' + volume / 100 + ',#ccc), color-stop(' + volume / 100 + ',rgba(0,0,0,0)), to(rgba(0,0,0,0)))';
            this.volumeSlider.css('background-image', backgroundImage);

            var activeBars = Math.ceil((volume / 25));
            this.muteButton.find('.MuteButtonBar:lt(' + (activeBars + 1) + ')').css('fill', '#fff');
            this.muteButton.find('.MuteButtonBar:gt(' + activeBars + ')').css('fill', '#666');

            if (activeBars === 0) {
                this.muteButton.find('.MuteButtonBar').css('fill', '#666');
            }

            var isMuted = Player.get('muted');

            if (isMuted) {
                this.muteButton
                    .addClass('muted')
                    .attr('title', 'Click to unmute.');
            } else {
                this.muteButton
                    .removeClass('muted')
                    .attr('title', 'Click to mute.');
            }

            return this;
        },

        //  Initialize player's volume and muted state to last known information or 100 / unmuted.
        initialize: function () {
            this.muteButton.attr('title', chrome.i18n.getMessage("toggleVolume"));
            this.volumeSlider.attr('title', chrome.i18n.getMessage("clickDragChangeVolume"));

            //  Set the initial volume of the control based on what the YouTube player says is the current volume.
            var volume = Player.get('volume');
            this.volumeSlider.val(volume).trigger('change');

            this.listenTo(Player, 'change:muted', this.render);

            this.render();
        },

        //  Whenever the volume slider is interacted with by the user, change the volume to reflect.
        setVolume: function () {

            var newVolume = parseInt(this.volumeSlider.val(), 10);
            Player.set('volume', newVolume);

            this.render();
        },

        //  Adjust volume when user scrolls mousewheel while hovering over volumeControl.
        scrollVolume: function (event) {
            var delta = event.originalEvent.wheelDeltaY / 120;

            //  Convert current value from string to int, then go an arbitrary, feel-good amount of volume points in a given direction (thus *3 on delta).
            var newVolume = parseInt(this.volumeSlider.val(), 10) + delta * 3;
            this.volumeSlider.val(newVolume).trigger('change');
        },

        toggleMute: function () {
            var isMuted = Player.get('muted');
            Player.set('muted', !isMuted);
        },

        //  Show the volume slider control by expanding its wrapper whenever any of the volume controls are hovered.
        expand: function () {
            this.$el.addClass('expanded');
        },

        contract: function () {
            this.$el.removeClass('expanded');
        }

    });

    return new VolumeControlView;
})