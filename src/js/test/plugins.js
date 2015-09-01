'use strict';
import 'test/phantomjs.shim';
import 'test/chrome.mock';
import 'common/shim/lodash.shim';
import 'common/shim/backbone.cocktail.shim';
import 'common/shim/backbone.marionette.view.shim';
import 'common/shim/backbone.marionette.region.shim';

import 'test/mochaSetup';
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