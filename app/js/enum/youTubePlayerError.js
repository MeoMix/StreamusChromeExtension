//  The possible error values that the YouTube player might throw.
//  Data comes from: https://developers.google.com/youtube/js_api_reference#onError
define({
    None: -1,
    //  2 – The request contains an invalid parameter value. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks.
    InvalidParameter: 2,
    //  100 – The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.
    VideoNotFound: 100,
    //  101 – The owner of the requested video does not allow it to be played in embedded players.
    NoPlayEmbedded: 101,
    //  150 – This error is the same as 101. It's just a 101 error in disguise!
    NoPlayEmbedded2: 150
});