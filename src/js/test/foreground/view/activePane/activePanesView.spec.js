import ActivePanesView from 'foreground/view/activePane/activePanesView';
import ActivePanes from 'foreground/collection/activePane/activePanes';
import SignInManager from 'background/model/signInManager';
import Settings from 'background/model/settings';
import ActivePlaylistManager from 'background/model/activePlaylistManager';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('ActivePanesView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new ActivePanesView({
      collection: new ActivePanes(null, {
        stream: TestUtility.buildStream(),
        settings: new Settings(),
        activePlaylistManager: new ActivePlaylistManager({
          signInManager: new SignInManager()
        })
      })
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});