// NOTE: Don't import test/phantomjs.shim because babel has a dependency on bind.
// Can't shim bind via an import if bind needs to exist to import.
// Once grunt-mocha supports phantom.js 2.0 then it'll be OK
import 'test/chrome.mock';
import 'common/shim/backbone.cocktail.shim';
import 'common/shim/backbone.marionette.region.shim';
import 'common/shim/backbone.marionette.toJson.shim';
import 'common/shim/backbone.marionette.view.shim';
import 'common/shim/handlebars.helpers.shim';
import 'common/shim/lodash.mixin.shim';
import 'common/shim/lodash.reference.shim';

import 'test/mochaSetup';
// Load bridge.js manually after importing mocha because it expects mocha to be defined.
import 'test/bridge';
import chai, {expect} from 'chai';
import sinon from 'sinon';

window.expect = expect;
window.sinon = sinon;

import BackgroundApplication from 'background/application';
import ForegroundApplication from 'foreground/application';
import TestUtility from 'test/testUtility';
import Test from 'test/test';

// Finally, load the tests:
window.StreamusBG = new BackgroundApplication();
window.StreamusBG.localDebug = true;
window.StreamusBG.instantiateBackgroundArea();

window.StreamusFG = new ForegroundApplication({
  backgroundProperties: window.StreamusBG.getExposedProperties(),
  backgroundChannels: window.StreamusBG.getExposedChannels()
});

window.TestUtility = TestUtility;
mocha.run();