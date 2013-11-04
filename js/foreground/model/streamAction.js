define([
    'settings',
    'streamItems',
    'genericPromptView',
    'clearStreamView',
    'saveVideosView'
], function (Settings, StreamItems, GenericPromptView, ClearStreamView, SaveVideosView) {

    var StreamAction = Backbone.Model.extend({
        clearStream: function () {

            if (StreamItems.length > 0) {
                var remindClearStream = Settings.get('remindClearStream');

                if (remindClearStream) {

                    var clearStreamPromptView = new GenericPromptView({
                        title: chrome.i18n.getMessage('confirmPromptTitle'),
                        model: new ClearStreamView
                    });

                    clearStreamPromptView.fadeInAndShow();

                } else {
                    StreamItems.clear();
                }

            }

        },
        
        saveStream: function() {
            if (StreamItems.length > 0) {

                var videos = StreamItems.pluck('video');

                var saveVideosPromptView = new GenericPromptView({
                    title: StreamItems.length === 1 ? chrome.i18n.getMessage('saveVideo') : chrome.i18n.getMessage('saveVideos'),
                    okButtonText: chrome.i18n.getMessage('saveButtonText'),
                    model: new SaveVideosView({
                        model: videos
                    })
                });

                saveVideosPromptView.listenTo(saveVideosPromptView.model, 'change:creating', function (creating) {

                    if (creating) {
                        this.okButton.text(chrome.i18n.getMessage('createAndSaveButtonText'));
                    } else {
                        this.okButton.text(chrome.i18n.getMessage('saveButtonText'));
                    }

                });

                saveVideosPromptView.fadeInAndShow();

            }
        }
    });

    return new StreamAction;
});