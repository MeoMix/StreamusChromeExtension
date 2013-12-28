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

        //  Don't set width/height inside of the jQuery creator because width/height are set as css properties not as properties of the canvas.
        var canvas = $('<canvas>', {
            id: 'YouTubeVideoCanvas'
        }).prop({
            //  TODO: These magic numbers are synced in a couple of spots. Need to figure out how to standardize.
            width: 640,
            height: 360
        });

        $('body').append(canvas);

        var context = canvas[0].getContext('2d');
        
        chrome.runtime.onConnect.addListener(function (videoViewPort) {

            if (videoViewPort.name === 'videoViewPort') {

                videoViewPort.onMessage.addListener(function (message) {
                    
                    if (message.getData) {
                        context.drawImage(videoStream[0], 0, 0);

                        videoViewPort.postMessage(
                            //  https://developers.google.com/speed/webp/
                            //  TODO: Experiment with toDataUrlHD (doesn't seem to be defined, but it should be?) and quality paramater of toDataURL( 0-1 value )
                            canvas[0].toDataURL('image/webp')
                        );
                    }

                });

            }

        });

    }

});