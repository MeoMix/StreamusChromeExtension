'use strict';
import AddVideoButtonView from 'foreground/view/listItemButton/addVideoButtonView';
import Video from 'background/model/video';
import StreamItems from 'background/collection/streamItems';
import ListItemButton from 'foreground/model/listItemButton/listItemButton';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

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

  ViewTestUtility.ensureBasicAssumptions.call(this);
});