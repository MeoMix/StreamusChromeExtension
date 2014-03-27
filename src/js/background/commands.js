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
            case 'nextSong':
                var activatedStreamItem = NextButton.tryActivateNextStreamItem();

                if (!activatedStreamItem) {
                    Notifications.showNotification({
                        title: chrome.i18n.getMessage('keyboardCommandFailure'),
                        message: chrome.i18n.getMessage('cantSkipToNextSong')
                    });
                }
                
                break;
            case 'previousSong':
                var didPrevious = PreviousButton.tryDoTimeBasedPrevious();
                
                if (!didPrevious) {
                    Notifications.showNotification({
                        title: chrome.i18n.getMessage('keyboardCommandFailure'),
                        message: chrome.i18n.getMessage('cantGoBackToPreviousSong')
                    });
                }
                
                break;
            case 'toggleSong':
                var didTogglePlayerState = PlayPauseButton.tryTogglePlayerState();

                if (!didTogglePlayerState) {
                    Notifications.showNotification({
                        title: chrome.i18n.getMessage('keyboardCommandFailure'),
                        message: chrome.i18n.getMessage('cantToggleSong')
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
            case 'saveActiveSong':
                Playlists.getActivePlaylist().addSongs(StreamItems.getActiveItem().get('song'));
                break;
            case 'deleteSongFromStream':
                StreamItems.getActiveItem().destroy();
                break;
            case 'copySongUrl':

                chrome.extension.sendMessage({
                    method: 'copy',
                    text: StreamItems.getActiveItem().get('song').get('url')
                });

                break;
            case 'copySongTitleAndUrl':                
                var activeItem = StreamItems.getActiveItem();
                
                chrome.extension.sendMessage({
                    method: 'copy',
                    text: '"' + activeItem.get('title') + '" - ' + activeItem.get('song').get('url')
                });

                break;
            case 'increaseVolume':
                var maxVolume = 100;
                var increasedVolume = Player.get('volume') + 5;
                
                if (increasedVolume > maxVolume) {
                    Player.set('volume', maxVolume);
                } else {
                    Player.set('volume', increasedVolume);
                }
                break;
            case 'decreaseVolume':
                var minVolume = 0;
                var decreasedVolume = Player.get('volume') - 5;

                if (decreasedVolume < minVolume) {
                    Player.set('volume', minVolume);
                } else {
                    Player.set('volume', decreasedVolume);
                }
                break;
            case 'showActiveSong':                
                StreamItems.showActiveNotification();
                break;
            default:
                console.error("Unhandled command:", command);
                break;
        }

    });

});