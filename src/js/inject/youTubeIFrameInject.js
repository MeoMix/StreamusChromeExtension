$(function() {
    //  TODO: Does this work even if I reload the iframe?
    //  Only run against our intended iFrame -- not embedded YouTube iframes on other pages.
    if (window.name === 'youtube-player') {
        var youTubeIFrameConnectRequestPort = chrome.runtime.connect({
            name: 'youTubeIFrameConnectRequest'
        });

        var monitorVideoStream = function () {
            var lastPostedTime = null;

            videoStream.on('loadstart', function() {
                lastPostedTime = null;
            });

            //  TimeUpdate has awesome resolution, but we only display to the nearest second.
            //  So, round currentTime and only send a message when the rounded value has changed, not the actual value.
            videoStream.on('timeupdate', function() {
                var currentTime = Math.ceil(this.currentTime);

                if (currentTime !== lastPostedTime) {
                    youTubeIFrameConnectRequestPort.postMessage({
                        currentTime: currentTime
                    });

                    lastPostedTime = currentTime;
                }
            });

            videoStream.on('seeking', function () {
                youTubeIFrameConnectRequestPort.postMessage({
                    seeking: true
                });
            });

            videoStream.on('seeked', function () {
                youTubeIFrameConnectRequestPort.postMessage({
                    seeking: false
                });
            });
        };

        var triesRemaining = 10;

        //  Monitor the video for change of src so that background can mimic player.
        var videoStream = $('.video-stream');

        console.log('length:', videoStream.length);

        //  If failed to find the videoStream -- keep searching for a bit. Opera loads too early and I guess this might be possible in Chrome, too.
        if (videoStream.length === 0) {
            var findVideoStreamInterval = setInterval(function () {
                if (triesRemaining <= 0) {
                    console.error("Expected to find a video stream element");
                    youTubeIFrameConnectRequestPort.postMessage({
                        error: 'Failed to find video-stream element'
                    });
                    clearInterval(findVideoStreamInterval);
                } else {
                    videoStream = $('.video-stream');

                    if (videoStream.length > 0) {
                        clearInterval(findVideoStreamInterval);
                        monitorVideoStream();
                    }
                }

                triesRemaining--;
            }, 200);
        } else {
            monitorVideoStream();
        }
    }
});