import _ from 'common/shim/lodash.reference.shim';
import {LayoutView} from 'marionette';
import DialogContent from 'foreground/view/behavior/dialogContent';
import deletePlaylistTemplate from 'template/dialog/deletePlaylist.hbs!';

var DeletePlaylistView = LayoutView.extend({
  template: deletePlaylistTemplate,

  behaviors: {
    DialogContent: {
      behaviorClass: DialogContent
    }
  },

  deletePlaylist: function() {
    this.model.destroy();
  }
});

export default DeletePlaylistView;