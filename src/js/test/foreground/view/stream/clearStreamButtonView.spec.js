'use strict';
import ClearStreamButtonView from 'foreground/view/stream/clearStreamButtonView';
import ClearStreamButton from 'foreground/model/stream/clearStreamButton';
import StreamItems from 'background/collection/streamItems';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('ClearStreamButtonView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new ClearStreamButtonView({
      model: new ClearStreamButton({
        streamItems: new StreamItems()
      })
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});