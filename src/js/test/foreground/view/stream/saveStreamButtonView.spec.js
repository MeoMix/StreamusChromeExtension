import SaveStreamButtonView from 'foreground/view/stream/saveStreamButtonView';
import SaveStreamButton from 'foreground/model/stream/saveStreamButton';
import StreamItems from 'background/collection/streamItems';
import SignInManager from 'background/model/signInManager';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('SaveStreamButtonView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new SaveStreamButtonView({
      model: new SaveStreamButton({
        streamItems: new StreamItems(),
        signInManager: new SignInManager()
      })
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});