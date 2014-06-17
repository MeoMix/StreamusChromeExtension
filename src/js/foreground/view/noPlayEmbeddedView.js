define([
    'text!template/noPlayEmbedded.html'
], function (NoPlayEmbeddedTemplate) {
    'use strict';

    var ReloadStreamusView = Backbone.Marionette.ItemView.extend({
        className: 'no-play-embedded',
        template: _.template(NoPlayEmbeddedTemplate),

        templateHelpers: {
            youTubePlayerErrorNoPlayEmbeddedMessage: chrome.i18n.getMessage('youTubePlayerErrorNoPlayEmbedded')
        },

        doOk: function () {
            chrome.runtime.reload();
        }
    });

    return ReloadStreamusView;
});