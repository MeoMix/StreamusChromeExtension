import 'common/shim/lodash.mixin.shim';
import 'common/shim/backbone.cocktail.shim';
import 'common/shim/backbone.marionette.view.shim';
import 'common/shim/backbone.marionette.region.shim';
import 'common/shim/backbone.marionette.toJson.shim';

// Finally, load the application:
import Application from 'background/application';
var streamusBG = new Application();
window.StreamusBG = streamusBG;
streamusBG.start();