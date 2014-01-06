//  This code runs on beatport.com domains.
$(function () {
    'use strict';
    
    //  Inject CSS via javascript to give it priority over all other CSS loaded on the page.
    var beatportCssUrl = 'css/beatportInject.css';

    var beatportInjectStylesheet = document.createElement('link');
    beatportInjectStylesheet.rel = 'stylesheet';
    beatportInjectStylesheet.type = 'text/css';
    beatportInjectStylesheet.href = chrome.extension.getURL(beatportCssUrl);
    document.head.appendChild(beatportInjectStylesheet);

    //  The beatport CSS url changes during deployment and there's no need to try and load another CSS file because it has been combined into one.
    if (beatportCssUrl == 'css/beatportInject.css') {
        var style = document.createElement('link');
        style.rel = 'stylesheet';
        style.type = 'text/css';
        style.href = chrome.extension.getURL('css/jquery.qtip.css');
        document.head.appendChild(style);
    }

    injectIconsBasedOnUrl();

    //  Need to check the URL whenever they click links to see if should inject.
    var checkUrlInterval;
    var timeout = 10000; //  Give it 10s to change before they'll need to refresh
    var pollingFrequency = 1000; //  Check every 1s

    //  Filter out streamus links because they obviously can't take the user anywhere.
    $(document).on('mousedown', 'a[href]', function () {

        var clickedLinkHref = $(this).attr('href');

        //  Stop any previous checks
        clearInterval(checkUrlInterval);

        //  Wait for browser to load and check occassionally until the URL matches or we give up.
        checkUrlInterval = setInterval(function () {

            var currentLocationHref = window.location.href;

            //  If they clicked something like /top-100, url will be beatport.com/top-100 so need to match both ways
            var clickedRoutingLink = clickedLinkHref.charAt(0) === '/';
            var hrefContainsRoutingLink = clickedRoutingLink && currentLocationHref.indexOf(clickedLinkHref) !== -1;

            if (currentLocationHref == clickedLinkHref || hrefContainsRoutingLink) {
                injectIconsBasedOnUrl();
                clearInterval(checkUrlInterval);
            }

            timeout -= pollingFrequency;

            if (timeout <= 0) {
                clearInterval(checkUrlInterval);
            }

        }, pollingFrequency);
        
    });

});


function injectIconsBasedOnUrl() {

    var currentPageUrl = window.location.href;

    var urlIsBeatportTop100 = currentPageUrl.match(/^.*beatport.com\/.*top-100.*/);
    var urlIsBeatportRelease = currentPageUrl.match(/^.*beatport.com\/.*release.*/);
    var urlIsBeatportTrack = currentPageUrl.match(/^.*beatport.com\/.*track.*/);
    var urlIsBeatportFrontPage = currentPageUrl.match(/^.*beatport.com.*/);

    if (urlIsBeatportTop100) {
        injectTop100Icons();
    } else if (urlIsBeatportRelease) {
        injectReleaseIcons();
    } else if (urlIsBeatportTrack) {
        //  TODO: Track support.
    } else if (urlIsBeatportFrontPage) {
        injectFrontPageIcons();
    } else {
        console.error("Failed to match:", href);
    }
}

function injectFrontPageIcons() {

    appendPlayAllButtonBeforeSelector('a.btn-play[data-trackable="Play All"]');

    var top10TracksPlayButtons = $('.btn-play[data-item-type="track"]');
    if (top10TracksPlayButtons.length === 0) throw "Failed to find play buttons";

    //  Inject a playVideo icon next to each icon on the page. This will stream the current item.
    top10TracksPlayButtons.each(function () {
        var trackName = $(this).data('item-name');
        var trackArtists = $(this).closest('.line').find('.itemRenderer-list').text();

        buildAndAppendButtonBeforeSelector($(this), trackName, trackArtists);
    });

}

function injectTop100Icons() {

    appendPlayAllButtonBeforeSelector('a.btn-play[data-trackable="Play All"]');

    var playButtons = $('.btn-play[data-item-name]');
    if (playButtons.length === 0) throw "Failed to find play buttons";

    //  Inject a playVideo icon next to each icon on the page. This will stream the current item.
    playButtons.each(function () {
        var trackName = $(this).data('item-name');
        var trackArtists = $(this).closest('tr.track-grid-content').find('.secondColumn').next().text();

        buildAndAppendButtonBeforeSelector($(this), trackName, trackArtists);
    });

}

function injectReleaseIcons() {
    
    appendPlayAllButtonBeforeSelector('div[data-module-type="release_detail"] a.btn-play[data-item-type="release"]');

    var playButtons = $('.btn-play[data-item-type="track"]');
    if (playButtons.length === 0) throw "Failed to find play buttons";

    //  Inject a playVideo icon next to each icon on the page. This will stream the current item.
    playButtons.each(function () {

        var trackName = $(this).data('item-name');
        var trackArtists = $(this).closest('tr.track-grid-content').find('.titleColumn').find('.artistList').text();

        buildAndAppendButtonBeforeSelector($(this), trackName, trackArtists);
    });

}

function buildAndAppendButtonBeforeSelector(selectorToAppendBefore, trackName, trackArtists) {

    var query = trackName.trim() + ' ' + trackArtists.replace(',', '').trim();

    var streamusPlayButton = $('<a>', {
        'class': 'streamus btn-play',
        'role': 'button',
        'data-query': query,
        'data-toggle': 'tooltip',
        'title': chrome.i18n.getMessage('play'),
        click: function () {

            var clickedItemQuery = $(this).data('query');

            chrome.runtime.sendMessage({
                method: "searchAndStreamByQuery",
                query: clickedItemQuery
            });

        }
    });

    var streamusLogoIcon = buildStreamusLogoIcon();

    selectorToAppendBefore.before(streamusPlayButton.add(streamusLogoIcon));
    streamusPlayButton.qtip({
        style: {
            classes: 'qtip-light qtip-shadow'
        }
    });
}

function appendPlayAllButtonBeforeSelector(selector) {

    var selectorToAppendBefore = $(selector);
    if (selectorToAppendBefore.length === 0) throw "Failed to find selector: " + selector;

    //  Find the playAll button at the top of the page and inject a Streamus 'Add All To Stream' button
    var streamusPlayAllButton = $('<a>', {
        'class': 'streamus btn-play',
        'role': 'button',
        'title': chrome.i18n.getMessage('playAll'),
        click: function () {
            //  TODO: Detect bad queries such (failure to find) and filter out. Maybe just do distinct for now?
            var itemQueries = $('.streamus.btn-play[data-query]').map(function (index, playButton) {
                var itemQuery = $(playButton).data('query');
                return itemQuery;
            });

            chrome.runtime.sendMessage({
                method: "searchAndStreamByQueries",
                queries: itemQueries.toArray()
            });

        }
    });

    var streamusLogoIcon = buildStreamusLogoIcon();
    
    selectorToAppendBefore.before(streamusPlayAllButton.add(streamusLogoIcon));
    streamusPlayAllButton.qtip({
        style: {
            classes: 'qtip-light qtip-shadow'
        }
    });
}

function buildStreamusLogoIcon() {
    var streamusLogoIcon = $('<a>', {
        'class': 'streamus btn-queue',
        'role': 'button'
    });

    return streamusLogoIcon;
}