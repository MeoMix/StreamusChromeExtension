//  Holds the logic for handling chrome.commands sent via keyboard shortcuts
define([
    'streamItems',
    'player',
    'nextButton',
    'previousButton',
    'playPauseButton',
    'radioButton',
    'repeatButton',
    'shuffleButton',
    'folders',
    'notifications'
], function (StreamItems, Player, NextButton, PreviousButton, PlayPauseButton, RadioButton, RepeatButton, ShuffleButton, Folders, Notifications) {
    'use strict';
    
    //  Receive keyboard shortcuts from users.
    chrome.commands.onCommand.addListener(function (command) {

        switch (command) {
            case 'nextVideo':
                var selectedNextVideo = NextButton.trySelectNextVideo();

                if (!selectedNextVideo) {
                    Notifications.showNotification({
                        title: chrome.i18n.getMessage('keyboardCommandFailure'),
                        body: chrome.i18n.getMessage('skipNextVideoDisabled')
                    });
                }
                
                break;
            case 'previousVideo':
                var didPrevious = PreviousButton.tryDoTimeBasedPrevious();
                
                if (!didPrevious) {
                    Notifications.showNotification({
                        title: chrome.i18n.getMessage('keyboardCommandFailure'),
                        body: chrome.i18n.getMessage('backPreviousVideoDisabled')
                    });
                }
                
                break;
            case 'toggleVideo':                
                var didTogglePlayerState = PlayPauseButton.tryTogglePlayerState();

                if (!didTogglePlayerState) {
                    Notifications.showNotification({
                        title: chrome.i18n.getMessage('keyboardCommandFailure'),
                        body: chrome.i18n.getMessage('toggleVideoDisabled')
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
                
                var activePlaylist = Folders.getActiveFolder().getActivePlaylist();
                activePlaylist.addByVideo(StreamItems.getSelectedItem().get('video'));

                break;
            case 'deleteVideoFromStream':
                StreamItems.getSelectedItem().destroy();
                
                break;
            case 'copyVideoUrl':
                var selectedVideoId = StreamItems.getSelectedItem().get('video').get('id');

                chrome.extension.sendMessage({
                    method: 'copy',
                    text: 'http://youtu.be/' + selectedVideoId
                });

                break;
            case 'copyVideoTitleAndUrl':                
                var selectedStreamItem = StreamItems.getSelectedItem();
                var videoId = StreamItems.getSelectedItem().get('video').get('id');
                
                chrome.extension.sendMessage({
                    method: 'copy',
                    text: '"' + selectedStreamItem.get('title') + '" - http://youtu.be/' + videoId
                });

                break;
            default:
                console.error("Unhandled command:", command);
                break;
        }

    });

});