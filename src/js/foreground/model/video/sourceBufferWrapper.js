define(function() {
    'use strict';

    var SourceBufferWrapper = Backbone.Model.extend({
        defaults: function() {
            return {
                sourceBuffer: null,
                appendedBufferCount: 0,
                //  Buffered data which has already been leveraged by YouTube is cached on the background page and re-used as needed.
                bufferCache: []
            };
        },

        initialize: function() {
            //  IMPORTANT: Prefer binding like this rather than using .bind(this) inline because bind will return a new function.
            //  This will break unobserve because it expects to be given a reference to the original function.
            this._onObserveBufferCacheChange = this._onObserveBufferCacheChange.bind(this);
            this._onUpdate = this._onUpdate.bind(this);
            this._onWindowUnload = this._onWindowUnload.bind(this);
            window.addEventListener('unload', this._onWindowUnload);
            this.on('change:sourceBuffer', this._onChangeSourceBuffer);
        },

        //  Called only before removing all references to the model - prevents memory leaks
        cleanup: function() {
            window.removeEventListener('unload', this._onWindowUnload);
            this.set('sourceBuffer', null);
        },

        _onChangeSourceBuffer: function(model, sourceBuffer) {
            if (sourceBuffer === null) {
                var previousSourceBuffer = this.previous('sourceBuffer');

                if (previousSourceBuffer !== null) {
                    this._stopMonitoringSourceBuffer(previousSourceBuffer);
                }
            } else {
                this._startMonitoringSourceBuffer(sourceBuffer);
            }
        },

        //  _onUpdate will run whenever sourceBuffer has updated itself and is ready to accept more data.
        _onUpdate: function() {
            this._loadNextBuffer();
        },

        _onWindowUnload: function() {
            //  It's important to call unobserve on bufferCache because bufferCache originates from the background page.
            //  Without this, a memory leak is formed and _onObserveBufferCacheChange can fire without an existing foreground page.
            Array.unobserve(this.get('bufferCache'), this._onObserveBufferCacheChange);
        },

        //  This callback will run whenever the bufferCache Array announces that changes have been made to it.
        //  The only announcement expected is for elements to be added or removed from it. When buffers are added they can be utilized.
        _onObserveBufferCacheChange: function() {
            Array.unobserve(this.get('bufferCache'), this._onObserveBufferCacheChange);
            this._loadNextBuffer();
        },

        //  Listen for a given sourceBuffer's update events and attempt to populate the buffer with data if available.
        _startMonitoringSourceBuffer: function(sourceBuffer) {
            sourceBuffer.addEventListener('update', this._onUpdate);
            this._loadNextBuffer();
        },

        //  Stop listening for a given sourceBuffer's update events and also cancel any async requests for data which may be in progress.
        _stopMonitoringSourceBuffer: function(sourceBuffer) {
            sourceBuffer.removeEventListener('update', this._onUpdate);
            Array.unobserve(this.get('bufferCache'), this._onObserveBufferCacheChange);
        },

        //  Attempt to retrieve the next buffer of data which should be rendered. If no additional data exists, or hasn't been received,
        //  return nothing.
        _getNextBuffer: function() {
            var nextBuffer = null;
            var bufferCache = this.get('bufferCache');
            var appendedBufferCount = this.get('appendedBufferCount');

            if (bufferCache.length > appendedBufferCount) {
                nextBuffer = bufferCache[appendedBufferCount];
            }

            return nextBuffer;
        },

        //  Make an attempt at appending buffer data, or, if no data is ready, setup an intent to append buffer data in the future.
        _loadNextBuffer: function() {
            var nextBuffer = this._getNextBuffer();

            //  If more data has been loaded then go ahead and append it. Otherwise, wait for the data to come in.
            if (nextBuffer === null) {
                Array.observe(this.get('bufferCache'), this._onObserveBufferCacheChange);
            } else {
                this._appendBuffer(nextBuffer);
            }
        },

        //  Append data to the buffer and keep track of how many buffers have been loaded so that
        //  the buffer chunks are loaded in the correct order.
        _appendBuffer: function(buffer) {
            var sourceBuffer = this.get('sourceBuffer');

            //  sourceBuffer could be processing data and will throw an error if given more
            if (!sourceBuffer.updating) {
                sourceBuffer.appendBuffer(buffer);
                this.set('appendedBufferCount', this.get('appendedBufferCount') + 1);
            }
        }
    });

    return SourceBufferWrapper;
});