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
        
        //  TODO: Some sort of error icon for the failure notifications?

        switch (command) {
            case 'nextVideo':
                var selectedNextVideo = NextButton.trySelectNextVideo();

                if (!selectedNextVideo) {
                    Notifications.showNotification({
                        title: 'Keyboard Command Failure',
                        body: 'Can\'t skip to the next video.'
                    });
                }
                
                break;
            case 'previousVideo':
                var didPrevious = PreviousButton.tryDoTimeBasedPrevious();
                
                if (!didPrevious) {
                    Notifications.showNotification({
                        title: 'Keyboard Command Failure',
                        body: 'Can\'t go to the previous video.'
                    });
                }
                
                break;
            case 'toggleVideo':                
                var didTogglePlayerState = PlayPauseButton.tryTogglePlayerState();

                if (!didTogglePlayerState) {
                    Notifications.showNotification({
                        title: 'Keyboard Command Failure',
                        body: 'Can\'t toggle the current video state.'
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
                
                var activeFolder = Folders.getActiveFolder();
                var selectedStreamItem = StreamItems.getSelectedItem();
                activeFolder.getActivePlaylist().addByVideo(selectedStreamItem.get('video'));

                break;
            case 'deleteVideoFromStream':
                var selectedStreamItem = StreamItems.getSelectedItem();
                selectedStreamItem.destroy();
                
                break;
            case 'copyVideoUrl':
                var selectedStreamItem = StreamItems.getSelectedItem();

                chrome.extension.sendMessage({
                    method: 'copy',
                    text: 'http://youtu.be/' + selectedStreamItem.get('video').get('id')
                });

                break;
            case 'copyVideoTitleAndUrl':                
                var selectedStreamItem = StreamItems.getSelectedItem();
                
                chrome.extension.sendMessage({
                    method: 'copy',
                    text: '"' + selectedStreamItem.get('title') + '" - http://youtu.be/' + selectedStreamItem.get('video').get('id')
                });

                break;
            default:
                console.error("Unhandled command:", command);
                break;
        }

    });

});