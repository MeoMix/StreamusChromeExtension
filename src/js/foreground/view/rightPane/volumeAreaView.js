//  VolumeView represents the mute/unmute button as well as the volume slider.
//  Interacting with these controls will affect the muted state and volume of the YouTube player.
define([
    'text!template/rightPane/volumeArea.html'
], function (VolumeAreaTemplate) {
    'use strict';

    var VolumeAreaView = Backbone.Marionette.ItemView.extend({
        id: 'volumeArea',
        template: _.template(VolumeAreaTemplate),
        
        ui: {
            volumeProgress: '#volumeArea-volumeProgress',
            volumeRange: '#volumeArea-volumeRange',
            volumeIcon: '#volumeArea-volumeIcon',
            volumeButton: '#volumeArea-volumeButton',
            slidePanel: '#volumeArea-slidePanel'
        },

        events: {
            'input @ui.volumeRange': '_setVolume',
            'click @ui.volumeButton': '_toggleMute',
            'mousewheel': '_scrollVolume'
        },
       
        modelEvents: {
            'change:muted': '_onChangeMuted',
            'change:volume': '_onChangeVolume'
        },

        onRender: function () {
            var volume = this.model.get('volume');
            this._setVolumeProgress(volume);
            this._setVolumeIconClass(volume);

            var muted = this.model.get('muted');
            this._setMutedClass(muted);

            this.$el.hoverIntent(this._expand.bind(this), this._collapse.bind(this));
        },
        
        _expand: function () {
            this.ui.slidePanel.addClass('is-expanded');
        },
        
        _collapse: function () {
            this.ui.slidePanel.removeClass('is-expanded');
        },

        _setVolume: function () {
            var volume = parseInt(this.ui.volumeRange.val());
            this.model.setVolume(volume);
        },
        
        _setVolumeProgress: function (volume) {
            this.ui.volumeRange.val(volume);
            this.ui.volumeProgress.height(volume + '%');
        },
        
        _setVolumeIconClass: function(volume) {
            var volumeIconClass = this._getVolumeIconClass(volume);
            this.ui.volumeIcon.removeClass('fa-volume-off fa-volume-up fa-volume-down').addClass(volumeIconClass);
        },

        //  Return whichever font-awesome icon class is appropriate based on the current volume level.
        _getVolumeIconClass: function (volume) {
            var volumeIconClass = 'fa-volume-';

            if (volume > 50) {
                volumeIconClass += 'up';
            }
            else if (volume > 0) {
                volumeIconClass += 'down';
            } else {
                volumeIconClass += 'off';
            }
            
            return volumeIconClass;
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

            this.model.setVolume(volume);
        },

        _toggleMute: function () {
            var isMuted = this.model.get('muted');
            this.model.save({
                muted: !isMuted
            });
        },

        _setMutedClass: function (muted) {
            this.ui.volumeButton.toggleClass('is-muted', muted);
        },

        _onChangeVolume: function (model, volume) {
            this._setVolumeProgress(volume);
            this._setVolumeIconClass(volume);
        },
        
        _onChangeMuted: function(model, muted) {
            this._setMutedClass(muted);
        }
    });

    return VolumeAreaView;
});