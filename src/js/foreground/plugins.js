import 'common/shim/backbone.marionette.view.shim';
import 'common/shim/backbone.marionette.region.shim';
import 'common/shim/backbone.marionette.toJson.shim';
import Application from 'foreground/application';

var backgroundPage = chrome.extension.getBackgroundPage();
var streamusFG = new Application({
  backgroundProperties: backgroundPage.StreamusBG.getExposedProperties(),
  backgroundChannels: backgroundPage.StreamusBG.getExposedChannels()
});
window.StreamusFG = streamusFG;
streamusFG.start();