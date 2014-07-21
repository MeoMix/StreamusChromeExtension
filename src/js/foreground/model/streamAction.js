define([
    'foreground/view/prompt/clearStreamPromptView',
    'foreground/view/clearStreamView',
    'foreground/view/prompt/saveSongsPromptView'
], function (ClearStreamPromptView, ClearStreamView, SaveSongsPromptView) {
    'use strict';

    var StreamItems = chrome.extension.getBackgroundPage().StreamItems;

    var StreamAction = Backbone.Model.extend({
        clearStream: function () {
            if (StreamItems.length > 0) {
                this._showClearStreamPrompt();
            }
        },
        
        saveStream: function() {
            if (StreamItems.length > 0) {
                this._showSaveSongsPrompt();
            }
        },
        
        _showClearStreamPrompt: function () {
            Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', ClearStreamPromptView);
        },
        
        _showSaveSongsPrompt: function() {
            Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', SaveSongsPromptView, {
                songs: StreamItems.pluck('song')
            });
        }
    });

    return new StreamAction();
});