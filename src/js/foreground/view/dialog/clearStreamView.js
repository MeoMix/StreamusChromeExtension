define(function(require) {
    'use strict';

    var DialogContent = require('foreground/view/behavior/dialogContent');

    var ClearStreamView = Marionette.LayoutView.extend({
        template: _.template(chrome.i18n.getMessage('clearStreamQuestion')),
        behaviors: {
            DialogContent: {
                behaviorClass: DialogContent
            }
        }
    });

    return ClearStreamView;
});