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
    'user'
], function (StreamItems, Player, NextButton, PreviousButton, PlayPauseButton, RadioButton, RepeatButton, ShuffleButton, User) {
    'use strict';
    
    //  Receive keyboard shortcuts from users.
    chrome.commands.onCommand.addListener(function (command) {
        
        switch (command) {
        
            case 'nextVideo':
                var selectedNextVideo = NextButton.trySelectNextVideo();

                if (!selectedNextVideo) {
                    //  TODO: Display notification indicating the fact that can't skip.
                    console.log("Can't skip to next video.");
                }
                
                break;
                
            case 'previousVideo':
                var didPrevious = PreviousButton.tryDoTimeBasedPrevious();
                
                if (!didPrevious) {
                    //  TODO: Display notification indicating the fact that can't previous.
                    console.log("Can't goto previous video.");
                }
                
                break;
               
            case 'toggleVideo':                
                var didTogglePlayerState = PlayPauseButton.tryTogglePlayerState();

                if (!didTogglePlayerState) {
                    //  TODO: Display notification indicating the fact that can't toggle.
                    console.log("Can't toggle video.");
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
                
                var activeFolder = User.get('folders').getActiveFolder();
                var selectedStreamItem = StreamItems.getSelectedItem();
                activeFolder.getActivePlaylist().addItem(selectedStreamItem.get('video'));

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