'use strict';
import {Model} from 'backbone';

var CreatePlaylist = Model.extend({
  defaults: {
    valid: false,
    dataSourceValid: true,
    titleValid: false
  },

  initialize: function() {
    this.on('change:dataSourceValid', this._onChangeDataSourceValid);
    this.on('change:titleValid', this._onChangeTitleValid);
  },

  _onChangeDataSourceValid: function(model, dataSourceValid) {
    var valid = dataSourceValid && this.get('titleValid');
    this.set('valid', valid);
  },

  _onChangeTitleValid: function(model, titleValid) {
    var valid = titleValid && this.get('dataSourceValid');
    this.set('valid', valid);
  }
});

export default CreatePlaylist;