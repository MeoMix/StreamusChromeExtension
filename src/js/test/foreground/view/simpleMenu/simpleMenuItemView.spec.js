import SimpleMenuItemView from 'foreground/view/simpleMenu/simpleMenuItemView';
import SimpleMenuItem from 'foreground/model/simpleMenu/simpleMenuItem';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('SimpleMenuItemView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new SimpleMenuItemView({
      model: new SimpleMenuItem()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});