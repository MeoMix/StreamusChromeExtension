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
        
        //var canvas = $('<canvas>', {
        //    id: 'YouTubeVideoCanvas'
        //});

        //$('body').append(canvas);

        //var context = canvas[0].getContext('2d');

        //setInterval(function () {
        //    console.log("I am now drawing image onto context", context);
        //    context.drawImage(videoStream[0], 0, 0, 200, 200);
            
        //    console.log("Data URL:", canvas[0].toDataURL());
        //}, 4000);
        
        //var observer = new window.WebKitMutationObserver(function (mutations) {

        //    if (mutations.length > 1) throw "Expected to receive only one mutation, actual: " + mutations.length;

        //    var srcMutation = mutations[0];
        //    var videoStreamSrc = srcMutation.target.getAttribute(srcMutation.attributeName);

        //    console.log("VideoStreamSrc has changed:", videoStreamSrc);

        //    if (videoStreamSrc && $.trim(videoStreamSrc) != '') {

        //        port.postMessage({
        //            videoStreamSrc: videoStreamSrc
        //        });

        //    }
        //});

        //observer.observe(videoStream[0], {
        //    attributes: true,
        //    attributeFilter: ['src']
        //});

    }

});