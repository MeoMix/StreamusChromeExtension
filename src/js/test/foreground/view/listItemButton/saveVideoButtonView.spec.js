define(function(require) {
  'use strict';

  var SaveVideoButtonView = require('foreground/view/listItemButton/saveVideoButtonView');
  var Video = require('background/model/video');
  var SignInManager = require('background/model/signInManager');
  var ListItemButton = require('foreground/model/listItemButton/listItemButton');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('SaveVideoButtonView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new SaveVideoButtonView({
        model: new ListItemButton(),
        video: new Video(),
        signInManager: new SignInManager()
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});