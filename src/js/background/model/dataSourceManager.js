'use strict';
import {Model} from 'backbone';
import DataSource from 'background/model/dataSource';

// Builds DataSource objects which originate from the background's instance of BB.
// Necessary for getting expected results from 'instanceof' checks.
var DataSourceManager = Model.extend({
  getDataSource: function(options) {
    return new DataSource(options);
  }
});

export default DataSourceManager;