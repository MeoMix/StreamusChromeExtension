define(function(require) {
  'use strict';

  var SaveStreamButtonView = require('foreground/view/stream/saveStreamButtonView');
  var SaveStreamButton = require('foreground/model/stream/saveStreamButton');
  var StreamItems = require('background/collection/streamItems');
  var SignInManager = require('background/model/signInManager');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('SaveStreamButtonView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new SaveStreamButtonView({
        model: new SaveStreamButton({
          streamItems: new StreamItems(),
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