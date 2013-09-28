var style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = chrome.extension.getURL('css/beatportInject.css');
document.head.appendChild(style);

//  This code runs on beatport.com domains.
$(function () {
    'use strict';

    //  Get references to our needed elements and make sure that worked properly.
    var playAllWrapper = $('.playAll-wrapper');

    if (playAllWrapper.length === 0) throw "Failed to find playAll-wrapper";

    
    //  Find the playAll button at the top of the page and inject a Streamus 'Add All To Stream' button
    var streamusPlayAllIcon = $('<a>', {
        'class': 'streamus btn-play',
        'role': 'button',
        'href': 'javascript:void(0)',
        'title': chrome.i18n.getMessage("playAllInStreamus"),
        click: function () {

            var videoTitles = _.map($('.streamus.btn-play[data-item-name]'), function (playButton) {
                var videoTitle = $(playButton).data('item-name') + ' ' + $(playButton).data('artists');
                return videoTitle;
            });

            console.log("Titles:", videoTitles);

            chrome.runtime.sendMessage({
                method: "addAndPlayStreamItemsByTitles",
                videoTitles: videoTitles
            });

        }
    });

    playAllWrapper.find('.btn-play').before(streamusPlayAllIcon);
    
    var playButtons = $('.btn-play[data-item-name]');
    if (playButtons.length === 0) throw "Failed to find play buttons";
    
    //  Inject a playVideo icon next to each icon on the page. This will stream the current item.
    _.each(playButtons, function(button) {

        var itemName = $(button).data('item-name');

        var parentRow = $(button).closest('tr.track-grid-content');
        var artistColumn = parentRow.find('.secondColumn').next();
        var itemArtists = artistColumn.text();
        
        var streamusPlayIcon = $('<a>', {
            'class': 'streamus btn-play',
            'role': 'button',
            'href': 'javascript:void(0)',
            'data-item-name': itemName,
            'data-artists': itemArtists,
            'title': chrome.i18n.getMessage("playInStreamus"),
            click: function() {

                var videoTitle = $(this).data('item-name');
                var artists = $(this).data('artists');

                chrome.runtime.sendMessage({
                    method: "addAndPlayStreamItemByTitle",
                    videoTitle: videoTitle + ' ' + artists
                });


            }
        });

        $(button).before(streamusPlayIcon);

    });

});