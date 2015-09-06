import ErrorDialogView from 'foreground/view/dialog/errorDialogView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('ErrorDialogView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new ErrorDialogView({
      player: TestUtility.buildPlayer()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});