// Code from https://github.com/borismus/keysocket

var PREV = 'prev';
var PLAY = 'play-pause';
var NEXT = 'next';
var STOP = 'stop';
var activeTabs = [];


function onKeyPress(key) {
    if(key === NEXT) {
        chrome.extension.getBackgroundPage().nextButton.tryActivateNextStreamItem();
    }
    if (key === PLAY) {
        chrome.extension.getBackgroundPage().playPauseButton.tryTogglePlayerState();
    }
    if (key === PREV) {
        chrome.extension.getBackgroundPage().previousButton.tryDoTimeBasedPrevious();
    }
}

chrome.commands.onCommand.addListener(function(command) {
    console.log('Command:', command);
    onKeyPress(command);
});
