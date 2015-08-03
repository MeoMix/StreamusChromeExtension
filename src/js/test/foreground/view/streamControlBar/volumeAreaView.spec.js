define(function(require) {
  'use strict';

  var VolumeAreaView = require('foreground/view/streamControlBar/volumeAreaView');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

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

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});