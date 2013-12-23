define([
    'foreground/view/genericForegroundView',
    'text!template/clearStream.html',
    'foreground/model/settings',
    'foreground/collection/streamItems'
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