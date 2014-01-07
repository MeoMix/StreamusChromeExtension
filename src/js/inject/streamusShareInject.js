//  This code only runs on the share.streamus.com sub-domain.
$(function () {
    'use strict';
    
    var streamusNotInstalledWarning = $('.streamusNotInstalledWarning');

    if (streamusNotInstalledWarning.length > 0) {
        streamusNotInstalledWarning.remove();
    }

    var currentUrl = document.URL;
    var urlSections = currentUrl.split('/');
    
    //  The last section of the URL should be the sharecode and the second to last section should be the indicator of playlist or stream.

    var indicator = urlSections[urlSections.length - 3];
    var shareCodeShortId = urlSections[urlSections.length - 2];
    var urlFriendlyEntityTitle = urlSections[urlSections.length - 1];

    if (indicator === 'playlist' && shareCodeShortId.length === 12 && urlFriendlyEntityTitle.length > 0) {
        chrome.runtime.sendMessage({
            method: "addPlaylistByShareData",
            shareCodeShortId: shareCodeShortId,
            urlFriendlyEntityTitle: urlFriendlyEntityTitle
        }, function (response) {
            
            var resultText;

            if (response.result === 'success') {
                resultText = chrome.i18n.getMessage('playlist') + ' ' + response.playlistTitle + ' ' + chrome.i18n.getMessage('addedSuccessfully').toLowerCase();
            } else {
                resultText = chrome.i18n.getMessage('anIssueWasEncounteredWhileAddingYourPlaylistCheckTheUrl');
            }

            $('hr').last().before($('<h3>', {
                text: resultText,
                'class': 'jumbotron'
            }));

        });
    }

});