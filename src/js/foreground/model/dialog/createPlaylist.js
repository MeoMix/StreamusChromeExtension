define(function() {
    'use strict';

    var CreatePlaylist = Backbone.Model.extend({
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

    return CreatePlaylist;
});