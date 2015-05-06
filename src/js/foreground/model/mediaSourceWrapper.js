define(function(require) {
    'use strict';

    var SourceBufferWrapper = require('foreground/model/sourceBufferWrapper');

    var MediaSourceWrapper = Backbone.Model.extend({
        defaults: function() {
            return {
                mediaSource: new window.MediaSource(),
                sourceBufferWrapper: null,
                //  The video encoding format and codec used to render mediaSource; i.e. video/webm codecs="vp9"
                bufferType: '',
                //  The URL which points to mediaSource's data
                objectURL: null
            };
        },

        initialize: function() {
            //  IMPORTANT: Prefer binding like this rather than using .bind(this) inline because bind will return a new function.
            //  This will break unobserve because it expects to be given a reference to the original function.
            this._onSourceOpen = this._onSourceOpen.bind(this);
            this._onSourceClose = this._onSourceClose.bind(this);
            this._onSourceEnded = this._onSourceEnded.bind(this);

            var mediaSource = this.get('mediaSource');
            mediaSource.addEventListener('sourceopen', this._onSourceOpen);
            mediaSource.addEventListener('sourceclose', this._onSourceClose);
            mediaSource.addEventListener('sourceended', this._onSourceEnded);

            this.on('change:bufferType', this._onChangeBufferType);
        },

        cleanup: function() {
            var mediaSource = this.get('mediaSource');
            mediaSource.removeEventListener('sourceopen', this._onSourceOpen);
            mediaSource.removeEventListener('sourceclose', this._onSourceClose);
            mediaSource.removeEventListener('sourceended', this._onSourceEnded);

            this._detachBuffer();
        },

        _onChangeBufferType: function(model, bufferType) {
            this._setBuffer(bufferType);
        },

        _onSourceOpen: function() {
            this._attachBuffer();
        },

        _onSourceClose: function() {
            this._detachBuffer();
        },

        _onSourceEnded: function() {
            this._detachBuffer();
        },

        //  If a bufferType is known then create a sourceBuffer which will expect content encoded with that bufferType.
        //  Otherwise, clean-up any existing buffer since no content is expected.
        _setBuffer: function(bufferType) {
            if (bufferType === '') {
                this._destroyBuffer();
            } else {
                this._createBuffer();
            }
        },

        //  Creating a buffer mostly consists of setting the objectURL of the source.
        //  Once that is set, the source will transition to the 'open' state and the buffer will become usable.
        _createBuffer: function() {
            if (this.get('sourceBufferWrapper') === null) {
                this.set({
                    sourceBufferWrapper: new SourceBufferWrapper({
                        bufferCache: Streamus.backgroundPage.player.get('buffers')
                    }),
                    //  Recreate objectURL whenever sourceBufferWrapper is modified or video won't start properly.
                    objectURL: window.URL.createObjectURL(this.get('mediaSource'))
                });
            } else {
                console.error('sourceBufferWrapper already created');
            }
        },

        //  Destroying a buffer means cleaning up the existing buffer from the source and clearing the objectURL.
        //  When the objectURL is cleared the source will transition to the 'closed' state and become unusable.
        _destroyBuffer: function() {
            var sourceBufferWrapper = this.get('sourceBufferWrapper');

            if (sourceBufferWrapper !== null) {
                this.get('mediaSource').removeSourceBuffer(sourceBufferWrapper.get('sourceBuffer'));
                //  Setting objectURL to null will cause _onSourceClose to fire because the video element's src is cleared.
                this.set('objectURL', null);
            } else {
                console.error('sourceBuffer already destroyed');
            }
        },

        //  Only attach a buffer to a MediaSource which is 'open'
        _attachBuffer: function() {
            var buffer = this.get('mediaSource').addSourceBuffer(this.get('bufferType'));
            this.get('sourceBufferWrapper').set('sourceBuffer', buffer);
        },

        //  Only detach a buffer from a MediaSource which is 'closed' or 'ended'.
        _detachBuffer: function() {
            var sourceBufferWrapper = this.get('sourceBufferWrapper');

            if (sourceBufferWrapper !== null) {
                sourceBufferWrapper.cleanup();
                this.set('sourceBufferWrapper', null);
            }
        }
    });

    return MediaSourceWrapper;
});