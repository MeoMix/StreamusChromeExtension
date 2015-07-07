define(function(require) {
  'use strict';

  var ActivePanesView = require('foreground/view/activePane/activePanesView');
  var ActivePanes = require('foreground/collection/activePane/activePanes');
  var SignInManager = require('background/model/signInManager');
  var Settings = require('background/model/settings');
  var ActivePlaylistManager = require('background/model/activePlaylistManager');
  var ViewTestUtility = require('test/foreground/view/viewTestUtility');
  var TestUtility = require('test/testUtility');

  describe('ActivePanesView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new ActivePanesView({
        collection: new ActivePanes(null, {
          stream: TestUtility.buildStream(),
          settings: new Settings(),
          activePlaylistManager: new ActivePlaylistManager({
            signInManager: new SignInManager()
          })
        })
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    ViewTestUtility.ensureBasicAssumptions.call(this);
  });
});