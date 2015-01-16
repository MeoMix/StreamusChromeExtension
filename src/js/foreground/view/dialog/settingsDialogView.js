define([
    'foreground/model/dialog',
    'foreground/view/dialog/dialogView',
    'foreground/view/dialog/settingsView'
], function (Dialog, DialogView, SettingsView) {
    'use strict';
    
    var SettingsDialogView = DialogView.extend({
        id: 'settingsDialog',

        initialize: function () {
            this.model = new Dialog({
                title: chrome.i18n.getMessage('settings'),
                submitButtonText: chrome.i18n.getMessage('save')
            });

            this.contentView = new SettingsView({
                model: Streamus.backgroundPage.settings
            });
            
            DialogView.prototype.initialize.apply(this, arguments);
        },
        
        onSubmit: function() {
            this.contentView.save();
        }
    });

    return SettingsDialogView;
});