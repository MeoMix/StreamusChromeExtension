define([
    'background/model/dataSource'
], function (DataSource) {
    'use strict';

    //  TODO: This is necessary to provide the foreground with a DataSource object which is created from the background's instance of Backbone.
    //  I think it would be better to have the foreground load its plugins (Backbone, Marionette, Underscore) from the Background instead...
    var DataSourceManager = Backbone.Model.extend({
        getDataSource: function (options) {
            return new DataSource(options);
        }
    });

    return DataSourceManager;
})