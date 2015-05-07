(function() {
    'use strict';
    //  Only call postMessage for the given host's origin.
    var origin = (new URL(document.currentScript.src)).origin;
    //  Store information parsed out of YouTube's get_video_info request.
    //  This info will be used to determine the active video's needed codecs.
    var videoInfoList = [];

    //  Intercept XMLHttpRequest for YouTube's iframe and send a copy of video data outside the iframe.
    //  This allows for the video to be re-rendered on another page as efficiently as possible. 
    (function(open) {
        XMLHttpRequest.prototype.open = function() {
            this.addEventListener('load', function() {
                var responseURL = this.responseURL;
                var responseType = this.responseType;
                var isVideoInfo = responseURL.indexOf('get_video_info') !== -1;

                if (isVideoInfo && responseType === '') {
                    var decodedResponse = decodeURIComponent(this.response);
                    //  The 'adaptive-fmts' parameter stores the video information needed.
                    var encodedAdaptiveFormats = (decodedResponse.split('adaptive_fmts=')[1] || '').replace(/\+/g, ' ');
                    var encodedAdaptiveFormatList = encodedAdaptiveFormats.split(',');

                    //  Convert the encoded URL of adaptive formats into an array of objects since that's a lot easier to work with.
                    var decodedAdaptiveFormatList = encodedAdaptiveFormatList.map(function(encodedAdaptiveFormat) {
                        var decodedAdaptiveFormat = {};

                        encodedAdaptiveFormat.split('&').forEach(function(parameterPair) {
                            var parameterKeyValue = parameterPair.split('=');
                            var key = decodeURIComponent(parameterKeyValue[0]);
                            var value = decodeURIComponent(parameterKeyValue[1]);
                            decodedAdaptiveFormat[key] = value;
                        });

                        return decodedAdaptiveFormat;
                    });

                    //  Some of the video information received is for 'related videos' which needs to be discarded.
                    //  To do so, detect type/size on the video information because that indicates its for the current video.
                    //  Also check that the type is 'video' because it could contain audio information.
                    videoInfoList = decodedAdaptiveFormatList.filter(function(object) {
                        return !!object.type && !!object.size && object.type.indexOf('video') !== -1;
                    });
                } else if (responseType === 'arraybuffer') {
                    //  The itag is a unique identifier which provides a 1:1 between videoInfo and a video data response.
                    var itag = (responseURL.split('itag=')[1] || '').split('&')[0];

                    //  There's no guarantee that the current request is a video data response.
                    if (itag !== '') {
                        var videoInfo = videoInfoList.filter(function(object) {
                            return object.itag === itag;
                        })[0];

                        if (videoInfo) {
                            //  Notify Streamus of video information data necessary to render the video on another page.
                            //  The type of video (including codec) as well as the ArrayBuffer of video data.
                            var message = {
                                buffer: this.response.slice(0),
                                bufferType: videoInfo.type
                            };

                            //  Be sure to mark the buffer as transferable as it can be a large amount of data.
                            window.top.postMessage(message, origin, [message.buffer]);
                        }
                    }
                }
            });

            open.apply(this, arguments);
        };
    })(XMLHttpRequest.prototype.open);
})();