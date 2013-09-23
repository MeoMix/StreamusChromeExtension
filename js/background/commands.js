//  Holds the logic for handling chrome.commands sent via keyboard shortcuts
define([
    'streamItems',
    'player',
    'nextButton',
    'previousButton',
    'playPauseButton'
], function (StreamItems, Player, NextButton, PreviousButton, PlayPauseButton) {
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
                
            default:
                console.error("Unhandled command:", command);
                break;
        }

    });

});