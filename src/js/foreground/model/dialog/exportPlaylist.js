import {Model} from 'backbone';
import LocalStorage from 'lib/backbone.localStorage';
import ExportFileType from 'common/enum/exportFileType';

var ExportPlaylist = Model.extend({
  localStorage: new LocalStorage('ExportPlaylist'),

  defaults: {
    // Need to set id for Backbone.LocalStorage
    id: 'ExportPlaylist',
    playlist: null,
    fileType: ExportFileType.Csv
  },

  // Don't want to save the playlist to localStorage -- only the configuration variables
  blacklist: ['playlist'],
  toJSON: function() {
    return this.omit(this.blacklist);
  },

  initialize: function() {
    // Load from Backbone.LocalStorage
    this.fetch();
  }
});

export default ExportPlaylist;