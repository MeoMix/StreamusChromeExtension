define([
    'background/model/clipboard'
], function (Clipboard) {
    'use strict';

    var ClipboardView = Backbone.Marionette.ItemView.extend({
        id: 'clipboard',
        tagName: 'textarea',
        template: false,

        model: Clipboard,
        
        modelEvents: {
            'change:text': '_onChangeText'
        },
        
        _onChangeText: function (model, text) {
            this._copyText(text);
            this.model.set({ text: '' }, { silent: true });
        },
        
        //  http://stackoverflow.com/questions/5235719/how-to-copy-text-to-clipboard-from-a-google-chrome-extension
        //  Copies text to the clipboard. Has to happen on background page due to elevated privileges.
        _copyText: function(text) {
            this.$el.val(text).select();
            document.execCommand('copy', false, null);
        }
    });

    return ClipboardView;
});