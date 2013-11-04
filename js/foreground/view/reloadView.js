define([
    'text!../template/reload.htm'
], function (ReloadTemplate) {
    'use strict';

    var ReloadView = Backbone.View.extend({

        className: 'reload',

        template: _.template(ReloadTemplate),
        
        render: function () {

            this.$el.html(this.template({
                'chrome.i18n': chrome.i18n
            }));

            return this;
        },

        //  TODO: Maybe change save to a more generic term?
        save: function() {
            chrome.runtime.reload();
        }

    });

    return ReloadView;
});