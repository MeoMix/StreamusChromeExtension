'use strict';
import SaveVideoButtonView from 'foreground/view/listItemButton/saveVideoButtonView';
import Video from 'background/model/video';
import SignInManager from 'background/model/signInManager';
import ListItemButton from 'foreground/model/listItemButton/listItemButton';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

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

  ViewTestUtility.ensureBasicAssumptions.call(this);
});