define(function(require) {
  'use strict';

  var DataSource = require('background/model/dataSource');

  // Builds DataSource objects which originate from the background's instance of BB.
  // Necessary for getting expected results from 'instanceof' checks.
  var DataSourceManager = Backbone.Model.extend({
    getDataSource: function(options) {
      return new DataSource(options);
    }
  });

  return DataSourceManager;
});