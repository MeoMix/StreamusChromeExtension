define([
    'text!../template/clearStream.htm',
    'settings',
    'streamItems'
], function (ClearStreamTemplate, Settings, StreamItems) {
    'use strict';

    var ClearStreamView = Backbone.View.extend({

        className: 'clearStream',

        template: _.template(ClearStreamTemplate),
        
        reminderCheckbox: null,
        
        render: function() {
            this.$el.html(this.template({
                'chrome.i18n': chrome.i18n
            }));
            
            this.reminderCheckbox = this.$el.find('input#remindClearStream');

            return this;
        },
        
        save: function() {
                        
            var remindClearStream = !this.reminderCheckbox.is(':checked');
            Settings.set('remindClearStream', remindClearStream);

            StreamItems.clear();
        }
    });

    return ClearStreamView;
});