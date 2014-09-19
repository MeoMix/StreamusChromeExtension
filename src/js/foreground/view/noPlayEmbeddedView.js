define([
    'text!template/noPlayEmbedded.html'
], function (NoPlayEmbeddedTemplate) {
    'use strict';

    var NoPlayEmbeddedView = Backbone.Marionette.ItemView.extend({
        template: _.template(NoPlayEmbeddedTemplate),

        templateHelpers: {
            youTubePlayerErrorNoPlayEmbeddedMessage: chrome.i18n.getMessage('youTubePlayerErrorNoPlayEmbedded')
        },

        _doRenderedOk: function () {
            chrome.runtime.reload();
        }
    });

    return NoPlayEmbeddedView;
});