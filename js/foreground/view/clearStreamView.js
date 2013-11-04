define([
    'text!../template/clearStream.htm',
    'genericPromptView',
    'settings',
    'streamItems'
], function (ClearStreamTemplate, GenericPromptView, Settings, StreamItems) {
    'use strict';

    var ClearStreamView = GenericPromptView.extend({

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