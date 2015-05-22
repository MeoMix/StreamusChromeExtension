define(function(require) {
    'use strict';

    var DialogContent = require('foreground/view/behavior/dialogContent');

    var UpdateStreamusView = Marionette.LayoutView.extend({
        template: _.template(chrome.i18n.getMessage('anUpdateIsAvailable')),

        behaviors: {
            DialogContent: {
                behaviorClass: DialogContent
            }
        }
    });

    return UpdateStreamusView;
});