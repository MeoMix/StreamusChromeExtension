define(function(require) {
    'use strict';

    var DialogContent = require('foreground/view/behavior/dialogContent');

    var GoogleSignInView = Marionette.LayoutView.extend({
        template: _.template(chrome.i18n.getMessage('googleSignInMessage')),

        behaviors: {
            DialogContent: {
                behaviorClass: DialogContent
            }
        }
    });

    return GoogleSignInView;
});