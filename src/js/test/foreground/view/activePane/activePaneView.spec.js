define(function(require) {
  'use strict';

  var ActivePaneView = require('foreground/view/activePane/activePaneView');
  var ActivePlaylistManager = require('background/model/activePlaylistManager');
  var SignInManager = require('background/model/signInManager');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe(ActivePaneView, function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new ActivePaneView({
        activePlaylistManager: new ActivePlaylistManager({
          signInManager: new SignInManager()
        })
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});