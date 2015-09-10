import CheckboxView from 'foreground/view/element/checkboxView';
import Checkbox from 'foreground/model/element/checkbox';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('CheckboxView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new CheckboxView({
      model: new Checkbox()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});