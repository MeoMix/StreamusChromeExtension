define(function(require) {
  'use strict';

  var CreatePlaylistDialogView = require('foreground/view/dialog/createPlaylistDialogView');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('CreatePlaylistDialogView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new CreatePlaylistDialogView();
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);

    describe('onSubmit', function() {
      it('should create a playlist', function() {
        sinon.stub(this.view.contentView, 'createPlaylist');

        this.view.onSubmit();
        expect(this.view.contentView.createPlaylist.calledOnce).to.equal(true);

        this.view.contentView.createPlaylist.restore();
      });
    });
  });
});