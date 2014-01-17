//  This is mostly disabled until I fix: https://code.google.com/p/chromium/issues/detail?id=161471
//  This code runs inside of the MusicHolder iframe in the Streamus background -- hax!
$(function() {

    //  Only run against our intended iFrame -- not embedded YouTube iframes on other pages.
    if (window.name === 'MusicHolder') {
        
        var youTubeIFrameConnectRequestPort = chrome.runtime.connect({
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
                youTubeIFrameConnectRequestPort.postMessage({
                    currentTime: currentTime
                });

                lastPostedTime = currentTime;
            }

        });

        videoStream.on('seeking', function() {

            youTubeIFrameConnectRequestPort.postMessage({
                seeking: true
            });

        });

        videoStream.on('seeked', function() {

            youTubeIFrameConnectRequestPort.postMessage({
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

        var messageChannel = new MessageChannel();

        //  Transfer port2 to the background page to establish communications.
        window.parent.postMessage('connect', 'chrome-extension://jbnkffmindojffecdhbbmekbmkkfpmjd', [messageChannel.port2]);

        messageChannel.port1.onmessage = function (message) {
            console.log("iframe message:", message);
        };

        messageChannel.port1.start();
 
        var videoStreamingInterval = null;

        var context = canvas[0].getContext('2d');

        setTimeout(function() {
            //var parts = canvas[0].toDataURL().match(/data:([^;]*)(;base64)?,([0-9A-Za-z+/]+)/);

            //var binStr = atob(parts[3]);
            //var buf = new ArrayBuffer(binStr.length);
            //var view = new Uint8Array(buf);
            //for (var i = 0; i < view.length; i++)
            //    view[i] = binStr.charCodeAt(i);
            
            var uInt8Array = new Uint8Array(1024 * 1024 * 32); // 32MB
            for (var i = 0; i < uInt8Array.length; ++i) {
                uInt8Array[i] = i;
            }

            //console.log('posting msg', view, view.buffer);
            //messageChannel.port1.postMessage({
            //    view: view.buffer,
            //    type: parts[1]
            //}, [view.buffer]);

            messageChannel.port1.postMessage(uInt8Array.buffer, [uInt8Array.buffer]);
            messageChannel.port1.postMessage('hello');


            if (uInt8Array.buffer.byteLength) {
                throw "Failed to transfer buffer";
            }
        },1000);
        
        chrome.runtime.onConnect.addListener(function (videoViewPort) {

            if (videoViewPort.name === 'videoViewPort') {

                console.log("onConnect");

                clearInterval(videoStreamingInterval);
                videoStreamingInterval = setInterval(function () {
                    console.log("Sending message");
                    context.drawImage(videoStream[0], 0, 0);
                    
                    


                    //take apart data URL
                    //var parts = canvas[0].toDataURL().match(/data:([^;]*)(;base64)?,([0-9A-Za-z+/]+)/);

                    //console.log("Sub1:", parts[1]);

                    //assume base64 encoding
                    //var binStr = atob(parts[3]);

                    //convert to binary in ArrayBuffer
                    //var buf = new ArrayBuffer(binStr.length);
                    //var view = new Uint8Array(buf);
                    //for (var i = 0; i < view.length; i++)
                    //    view[i] = binStr.charCodeAt(i);

                    //window.parent.postMessage(view, '*', [view]);

                    //videoViewPort.postMessage(
                    //    //  https://developers.google.com/speed/webp/
                    //    //  TODO: toDataURLHD isn't available yet, but will be in the future. Lossless webp compression not available yet, either.
                    //    canvas[0].toDataURL('image/webp', 1)
                    //);
                    //  1000 / 60 for 60fps?
                }, 1000 / 60);

                videoViewPort.onDisconnect.addListener(function () {
                    console.log("onDisconnect detected -- clearing streaming interval");
                    clearInterval(videoStreamingInterval);
                });

            }

        });

        //chrome.runtime.onConnect.addListener(function (videoViewPort) {

        //    if (videoViewPort.name === 'videoViewPort') {

        //        videoViewPort.onMessage.addListener(function (message) {

        //            if (message.getData) {
        //                context.drawImage(videoStream[0], 0, 0);

        //                videoViewPort.postMessage(
        //                    //  https://developers.google.com/speed/webp/
        //                    //  TODO: Experiment with toDataUrlHD (doesn't seem to be defined, but it should be?) and quality paramater of toDataURL( 0-1 value )
        //                    canvas[0].toDataURL('image/webp')
        //                );
        //            }

        //        });

        //    }

        //});

    }

});