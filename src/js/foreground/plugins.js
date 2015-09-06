var backgroundPage = chrome.extension.getBackgroundPage();
// Overwrite lodash here to ensure all calls reference the background's lodash instance.
// Re-using the lodash instance prevents memory leaks due to idCounter id collisions.
window._ = backgroundPage._;
import 'common/shim/backbone.marionette.view.shim';
import 'common/shim/backbone.marionette.region.shim';
import 'common/shim/backbone.marionette.toJson.shim';

// Finally, load the application:
import Application from 'foreground/application';

var streamusFG = new Application({
  backgroundProperties: backgroundPage.StreamusBG.getExposedProperties(),
  backgroundChannels: backgroundPage.StreamusBG.getExposedChannels()
});
window.StreamusFG = streamusFG;
streamusFG.start();