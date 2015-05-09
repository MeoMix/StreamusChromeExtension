//  The possible error values that the YouTube player might throw.
//  Data comes from: https://developers.google.com/youtube/js_api_reference#onError
//  The values of these strings need to be numbers because they interface with a third-party API.
//  TODO: Refactor this so that it is background-only enum and expose a generic 'playerError' enum to the foreground.
define({
    None: -1,
    InvalidParameter: 2,
    //  Undocumented error that YouTube throws when it breaks due to internet issues and other unforseen circumstances.
    ReallyBad: 5,
    VideoNotFound: 100,
    NoPlayEmbedded: 101,
    NoPlayEmbedded2: 150
});