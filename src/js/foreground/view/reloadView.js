define([
   'foreground/view/genericForegroundView',
    'text!template/reload.html'
], function (GenericForegroundView, ReloadTemplate) {
    'use strict';

    var ReloadView = GenericForegroundView.extend({

        className: 'reload',

        template: _.template(ReloadTemplate),
       
        render: function () {

            this.$el.html(this.template({
                'chrome.i18n': chrome.i18n
            }));

            return this;
        },
        
        doOk: function () {
            chrome.runtime.reload();
        }

    });

    return ReloadView;
});