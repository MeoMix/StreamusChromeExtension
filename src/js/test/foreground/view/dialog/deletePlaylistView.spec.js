define(function(require) {
  'use strict';

  var DeletePlaylistView = require('foreground/view/dialog/deletePlaylistView');
  var TestUtility = require('test/testUtility');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('DeletePlaylistView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new DeletePlaylistView({
        model: TestUtility.buildPlaylist()
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);

    it('should destroy its model when calling deletePlaylist', function() {
      sinon.stub(this.view.model, 'destroy');

      this.view.deletePlaylist();
      expect(this.view.model.destroy.calledOnce).to.equal(true);

      this.view.model.destroy.restore();
    });
  });
});