'use strict';
import VolumeAreaView from 'foreground/view/streamControlBar/volumeAreaView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('VolumeAreaView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new VolumeAreaView({
      player: TestUtility.buildPlayer()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});