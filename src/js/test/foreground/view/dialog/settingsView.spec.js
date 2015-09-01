'use strict';
import SettingsView from 'foreground/view/dialog/settingsView';
import SignInManager from 'background/model/signInManager';
import Settings from 'background/model/settings';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('SettingsView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new SettingsView({
      model: new Settings(),
      signInManager: new SignInManager()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});