'use strict';
import SimpleListItemView from 'foreground/view/element/simpleListItemView';
import SimpleListItem from 'foreground/model/element/simpleListItem';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

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

  ViewTestUtility.ensureBasicAssumptions.call(this);
});