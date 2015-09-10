(function() {
  // Multiple instances of lodash should not be instantiated because lodash uses an internal counter, idCounter,
  // to generate unique IDs. This may result in collisions because the foreground and background pages share
  // references with each other. i.e. 'foo_100' could appear on both pages.
  // Force the foreground to leverage the background's lodash instance.
  var getBackgroundPageExists = window.chrome && chrome.extension && chrome.extension.getBackgroundPage;
  var backgroundPage = getBackgroundPageExists ? chrome.extension.getBackgroundPage() : null;
  var isForeground = backgroundPage && backgroundPage.window !== window;
  var _ = isForeground ? backgroundPage.window._ : require('lodash');
  // TODO: Global can be removed once BB upgraded to 1.2.3 (which seems buggy) or SystemJS supports 'format cjs' + deps injection.
  window._ = _;
  module.exports = _;
}(this));