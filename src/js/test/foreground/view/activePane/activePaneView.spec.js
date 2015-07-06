define(function(require) {
  'use strict';

  var ActivePaneView = require('foreground/view/activePane/activePaneView');
  var Panes = require('foreground/collection/activePane/panes');
  var SignInManager = require('background/model/signInManager');
  var Settings = require('background/model/settings');
  var ActivePlaylistManager = require('background/model/activePlaylistManager');
  var ViewTestUtility = require('test/foreground/view/viewTestUtility');
  var TestUtility = require('test/testUtility');

  describe('ActivePaneView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new ActivePaneView({
        collection: new Panes(null, {
          stream: TestUtility.buildStream(),
          signInManager: new SignInManager(),
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