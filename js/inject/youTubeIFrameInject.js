//  This is mostly disabled until I fix: https://code.google.com/p/chromium/issues/detail?id=161471

//  This code runs inside of the MusicHolder iframe in the Streamus background -- hax!
$(function () {

    //  Only run against our intended iFrame -- not embedded YouTube iframes on other pages.
    if (window.name === 'MusicHolder') {

        var port = chrome.runtime.connect({
            name: 'youTubeIFrameConnectRequest'
        });

        //  Monitor the video for change of src so that background can mimic player.
        var videoStream = $('.video-stream');
        
        if (videoStream.length === 0) throw "Expected to find a video stream element";
        if (videoStream.length > 1) throw "Expected to find only one video stream element, actual:" + videoStream.length;
        
        videoStream.on('timeupdate', function () {

            port.postMessage({
                currentTime: Math.ceil(this.currentTime)
            });

        });
        
        videoStream.on('seeking', function () {
            
            port.postMessage({
                seeking: true
            });

        });

        videoStream.on('seeked', function () {
            
            port.postMessage({
                seeking: false
            });

        });
        
        //var observer = new window.WebKitMutationObserver(function (mutations) {

        //    if (mutations.length > 1) throw "Expected to receive only one mutation, actual: " + mutations.length;

        //    var srcMutation = mutations[0];
        //    var videoStreamSrc = srcMutation.target.getAttribute(srcMutation.attributeName);

        //    //  Don't send a blank src across, I think?
        //    if (videoStreamSrc != null && $.trim(videoStreamSrc) != '') {
        //        chrome.runtime.sendMessage({
        //            method: "videoStreamSrcChange", videoStreamSrc: videoStreamSrc
        //        });
            
        //        videoStream.removeAttr('src');

        //        //  TODO: I think this is still broken in some scenarios.
        //        //  Blob data requires an initial seekTo trigger by the original YT player to give up data.
        //        if (videoStreamSrc.indexOf('blob') === -1) {

        //            chrome.runtime.sendMessage({
        //                method: "needSeekTo"
        //            });

        //        }

        //    }
        //});

        //observer.observe(videoStream[0], {
        //    attributes: true,
        //    attributeFilter: ['src']
        //});

    }

});