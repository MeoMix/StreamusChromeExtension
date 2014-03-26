define([
    'background/model/settings',
    'background/collection/streamItems',
    'foreground/model/genericPrompt',
    'foreground/view/prompt/genericPromptView',
    'foreground/view/clearStreamView',
    'foreground/view/prompt/saveSourcesPromptView'
], function (Settings, StreamItems, GenericPrompt, GenericPromptView, ClearStreamView, SaveSourcesPromptView) {

    var StreamAction = Backbone.Model.extend({
        clearStream: function () {

            if (StreamItems.length > 0) {
                var remindClearStream = Settings.get('remindClearStream');

                if (remindClearStream) {

                    var clearStreamPromptView = new GenericPromptView({
                        model: new GenericPrompt({
                            title: chrome.i18n.getMessage('areYouSure'),
                            view: new ClearStreamView()
                        })
                    });

                    clearStreamPromptView.fadeInAndShow();

                } else {
                    StreamItems.clear();
                }
            }

        },
        
        saveStream: function() {
            if (StreamItems.length > 0) {
                var saveSourcesPromptView = new SaveSourcesPromptView({
                    videos: StreamItems.pluck('video')
                });

                saveSourcesPromptView.fadeInAndShow();
            }
        }
    });

    return new StreamAction();
});