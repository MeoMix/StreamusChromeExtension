define([
    'genericForegroundView',
    'text!../template/clearStream.htm',
    'settings',
    'streamItems'
], function (GenericForegroundView, ClearStreamTemplate, Settings, StreamItems) {
    'use strict';

    var ClearStreamView = GenericForegroundView.extend({

        className: 'clearStream',

        template: _.template(ClearStreamTemplate),
        
        render: function() {
            this.$el.html(this.template({
                'chrome.i18n': chrome.i18n
            }));
            
            return this;
        },
        
        doOk: function () {
                        
            var remindClearStream = !this.$el.find('input#remindClearStream').is(':checked');
            Settings.set('remindClearStream', remindClearStream);

            StreamItems.clear();
        }
    });

    return ClearStreamView;
});