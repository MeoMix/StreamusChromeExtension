define(function() {
    'use strict';

    var ClipboardView = Backbone.View.extend({
        el: $('#clipboard'),
        
        initialize: function() {
            chrome.runtime.onMessage.addListener(this._onRuntimeMessage.bind(this));
        },
        
        _onRuntimeMessage: function(request) {
            if (request.method === 'copy') {
                this._copyText(request.text);
            }
        },
        
        //  http://stackoverflow.com/questions/5235719/how-to-copy-text-to-clipboard-from-a-google-chrome-extension
        //  Copies text to the clipboard. Has to happen on background page due to elevated privileges.
        _copyText: function(text) {
            this.$el.val(text).select();
            document.execCommand(request.method, false, null);
        }
    });

    return new ClipboardView();
});