import RadioGroupView from 'foreground/view/element/radioGroupView';
import RadioGroup from 'foreground/model/element/radioGroup';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('RadioGroupView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new RadioGroupView({
      model: new RadioGroup()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});