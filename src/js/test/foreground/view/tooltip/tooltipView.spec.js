import TooltipView from 'foreground/view/tooltip/tooltipView';
import Tooltip from 'foreground/model/tooltip/tooltip';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('TooltipView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new TooltipView({
      model: new Tooltip()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});