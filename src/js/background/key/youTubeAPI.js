define(function () {
    //  The Simple API Access API key is used here. Please note that it is set to allow "Referers: Any referer allowed" because
    //  a Google Chrome extension does not send a referer by design. As such, it seems easiest to allow any referer rather than try to 
    //  fix the extension for slightly improved security.
    //  Please note that I've specifically omitted this key from GitHub for security. 
    //  Feel free to generate your own in order to use YouTube's API: https://code.google.com/apis/console/
    //  A valid key will look something like:
    //  Key for browser apps (with referers)
    //  API key: -------------------------------
    //  Referers: Any referer allowed
    //  Activated on:	Apr 6, 2014 2:46 PM
    //  Activated by:	------------ – you
    var key = 'API_KEY_MISSING';

    if (key === 'API_KEY_MISSING') {
        console.error('YouTube API key is not present.');
    }

    return key;
});