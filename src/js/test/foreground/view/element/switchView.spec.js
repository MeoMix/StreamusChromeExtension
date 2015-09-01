'use strict';
import SwitchView from 'foreground/view/element/switchView';
import Switch from 'foreground/model/element/switch';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('SwitchView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new SwitchView({
      model: new Switch()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});