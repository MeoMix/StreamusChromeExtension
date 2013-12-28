//  This is mostly disabled until I fix: https://code.google.com/p/chromium/issues/detail?id=161471
//  This code runs inside of the MusicHolder iframe in the Streamus background -- hax!
$(function() {

    //  Only run against our intended iFrame -- not embedded YouTube iframes on other pages.
    if (window.name === 'MusicHolder') {

        var port = chrome.runtime.connect({
            name: 'youTubeIFrameConnectRequest'
        });

        //  Monitor the video for change of src so that background can mimic player.
        var videoStream = $('.video-stream');

        if (videoStream.length === 0) console.error("Expected to find a video stream element");
        if (videoStream.length > 1) console.error("Expected to find only one video stream element, actual:" + videoStream.length);

        var lastPostedTime;

        //  TimeUpdate has awesome resolution, but we only display to the nearest second.
        //  So, round currentTime and only send a message when the rounded value has changed, not the actual value.
        videoStream.on('timeupdate', function() {

            var currentTime = Math.ceil(this.currentTime);

            if (currentTime !== lastPostedTime) {
                port.postMessage({
                    currentTime: currentTime
                });

                lastPostedTime = currentTime;
            }

        });

        videoStream.on('seeking', function() {

            port.postMessage({
                seeking: true
            });

        });

        videoStream.on('seeked', function() {

            port.postMessage({
                seeking: false
            });

        });
        
        var canvas = $('<canvas>', {
            id: 'YouTubeVideoCanvas'
        });

        $('body').append(canvas);

        var context = canvas[0].getContext('2d');

        //  Whenever the foreground connects to the iframe -- start streaming canvas information through the port to it.
        var streamingCanvasInterval;
        
        chrome.runtime.onConnect.addListener(function (videoViewPort) {

            if (videoViewPort.name === 'videoViewPort') {

                streamingCanvasInterval = setInterval(function () {
                    console.log("streaming canvas...");
                    
                    context.drawImage(videoStream[0], 0, 0, 480, 360);
                    
                    videoViewPort.postMessage({
                        dataUrl: canvas[0].toDataURL()
                    });
                    //  Run at 60 FPS. Can't use window.requestAnimationFrame because the iframe is on an invisible background page.
                    //  This causes the browser to never yield an animation frame because it is never visible.
                }, 1000 / 60);

                videoViewPort.onDisconnect.addListener(function () {
                    console.log("Port is disconnecting.");
                    clearInterval(streamingCanvasInterval);
                });

            }

        });

    }

});