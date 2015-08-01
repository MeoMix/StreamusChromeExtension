// Loading scripts via RequireJS inside of content scripts requires patching RequireJS' load functionality.
// Without this patch, Chrome will isolate the loaded script's execution context from the content script.
// Bypass this using an XHR to load the script into the content script's execution context.
// See: https://github.com/nonowarn/content-script-with-requirejs for more details.
require.load = function(context, moduleName, url) {
  var xhr = new XMLHttpRequest();
  var evalResponseText = function(xhr) {
    /* jshint ignore:start */
    eval(xhr.responseText);
    /* jshint ignore:end */
    context.completeLoad(moduleName);
  };

  xhr.open('GET', url, true);
  xhr.onreadystatechange = function(e) {
    if (xhr.readyState === 4 && xhr.status === 200) {
      // we have to specifically pass the window context or underscore
      // will fail since it defines "root = this"
      evalResponseText.call(window, xhr);
    }
  };

  xhr.send(null);
};