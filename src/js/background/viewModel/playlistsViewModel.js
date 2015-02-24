define(function() {
    'use strict';

    var PlaylistsViewModel = Backbone.Model.extend({
        defaults: {
            scrollTop: 0
        }
    });

    return PlaylistsViewModel;
});