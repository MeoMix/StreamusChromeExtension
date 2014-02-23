//  Holds the logic for handling chrome.commands sent via keyboard shortcuts
define([
    'background/notifications',
    'background/collection/playlists',
    'background/collection/streamItems',
    'background/model/player',
    'background/model/buttons/nextButton',
    'background/model/buttons/previousButton',
    'background/model/buttons/playPauseButton',
    'background/model/buttons/radioButton',
    'background/model/buttons/repeatButton',
    'background/model/buttons/shuffleButton'
], function (Notifications, Playlists, StreamItems, Player, NextButton, PreviousButton, PlayPauseButton, RadioButton, RepeatButton, ShuffleButton) {
    'use strict';
    
    //  Receive keyboard shortcuts from users.
    chrome.commands.onCommand.addListener(function (command) {

        switch (command) {
            case 'nextVideo':
                var activatedNextVideo = NextButton.tryActivateNextVideo();

                if (!activatedNextVideo) {
                    Notifications.showNotification({
                        title: chrome.i18n.getMessage('keyboardCommandFailure'),
                        message: chrome.i18n.getMessage('cantSkipToNextVideo')
                    });
                }
                
                break;
            case 'previousVideo':
                var didPrevious = PreviousButton.tryDoTimeBasedPrevious();
                
                if (!didPrevious) {
                    Notifications.showNotification({
                        title: chrome.i18n.getMessage('keyboardCommandFailure'),
                        message: chrome.i18n.getMessage('cantGoBackToPreviousVideo')
                    });
                }
                
                break;
            case 'toggleVideo':                
                var didTogglePlayerState = PlayPauseButton.tryTogglePlayerState();

                if (!didTogglePlayerState) {
                    Notifications.showNotification({
                        title: chrome.i18n.getMessage('keyboardCommandFailure'),
                        message: chrome.i18n.getMessage('cantToggleVideoState')
                    });
                }
                
                break;
            case 'toggleRadio':
                RadioButton.toggleRadio();
                break;
            case 'toggleShuffle':                
                ShuffleButton.toggleShuffle();
                break;
            case 'toggleRepeat':
                RepeatButton.toggleRepeat();
                break;
            case 'addVideoToPlaylist':
                Playlists.getActivePlaylist().addByVideo(StreamItems.getActiveItem().get('video'));
                break;
            case 'deleteVideoFromStream':
                StreamItems.getActiveItem().destroy();
                break;
            case 'copyVideoUrl':

                chrome.extension.sendMessage({
                    method: 'copy',
                    text: StreamItems.getActiveItem().get('video').get('url')
                });

                break;
            case 'copyVideoTitleAndUrl':                
                var activeItem = StreamItems.getActiveItem();
                
                chrome.extension.sendMessage({
                    method: 'copy',
                    text: '"' + activeItem.get('title') + '" - ' + activeItem.get('video').get('url')
                });

                break;
            default:
                console.error("Unhandled command:", command);
                break;
        }

    });

});