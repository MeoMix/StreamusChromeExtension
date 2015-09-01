'use strict';
import {Model} from 'backbone';

var EditPlaylist = Model.extend({
  defaults: {
    playlist: null,
    valid: true
  }
});

export default EditPlaylist;