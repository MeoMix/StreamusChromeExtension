define(function(require) {
  'use strict';

  var DataSource = require('background/model/dataSource');

  // This is necessary to provide the foreground with a DataSource object which is created from the background's instance of Backbone.
  var DataSourceManager = Backbone.Model.extend({
    getDataSource: function(options) {
      return new DataSource(options);
    }
  });

  return DataSourceManager;
});