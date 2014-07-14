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
        
        _showClearStreamPrompt: function() {
            window.Application.vent.trigger('showPrompt', new ClearStreamPromptView());
        },
        
        _showSaveSongsPrompt: function() {
            window.Application.vent.trigger('showPrompt', new SaveSongsPromptView({
                songs: StreamItems.pluck('song')
            }));
        }
    });

    return new StreamAction();
});