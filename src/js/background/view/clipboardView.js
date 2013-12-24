define(function() {
    'use strict';

    var ClipboardView = Backbone.View.extend({
        
        el: $('textarea#clipboard'),
        
        initialize: function() {

            chrome.runtime.onMessage.addListener(function (request) {

                //  http://stackoverflow.com/questions/5235719/how-to-copy-text-to-clipboard-from-a-google-chrome-extension
                //  Copies text to the clipboard. Has to happen on background page due to elevated privileges.
                if (request.method === 'copy') {
                    this.$el.val(request.text).select();
                    document.execCommand('copy', false, null);
                }

                //  Return true to allow sending a response back.
                return true;
            }.bind(this));
        }

    });

    return new ClipboardView();
});