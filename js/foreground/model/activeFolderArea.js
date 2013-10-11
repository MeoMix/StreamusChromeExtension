define(function () {
    'use strict';

    var ActiveFolderArea = Backbone.Model.extend({

        defaults: function () {
            return {
                folder: null
            };
        }

    });

    return ActiveFolderArea;
});