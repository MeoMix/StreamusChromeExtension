define(function(require) {
  'use strict';

  var AddVideoButtonView = require('foreground/view/listItemButton/addVideoButtonView');
  var Video = require('background/model/video');
  var StreamItems = require('background/collection/streamItems');
  var ListItemButton = require('foreground/model/listItemButton/listItemButton');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('AddVideoButtonView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new AddVideoButtonView({
        model: new ListItemButton(),
        video: new Video(),
        streamItems: new StreamItems()
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});