define(function(require) {
    'use strict';

    var DialogContent = require('foreground/view/behavior/dialogContent');

    var ErrorView = Marionette.LayoutView.extend({
        template: _.template('<%= text %>'),
        templateHelpers: function() {
            return {
                text: this.text
            };
        },

        behaviors: {
            DialogContent: {
                behaviorClass: DialogContent
            }
        },

        text: '',

        initialize: function(options) {
            this.text = options.text;
        }
    });

    return ErrorView;
});