define(function(require) {
  'use strict';

  var SimpleListItemView = require('foreground/view/element/simpleListItemView');
  var SimpleListItem = require('foreground/model/element/simpleListItem');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('SimpleListItemView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new SimpleListItemView({
        model: new SimpleListItem()
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});