//  This code runs on beatport.com domains.
$(function () {
    'use strict';
    
    var enhanceBeatport = false;
    var injectData = {
        canEnhance: false
    };

    chrome.runtime.sendMessage({ method: 'getBeatportInjectData' }, function (beatportInjectData) {
        injectData = beatportInjectData;

        if (injectData.canEnhance) {
            injectCss();
            injectHtml();
            enhanceBeatport = true;
        }
    });
    
    chrome.runtime.onMessage.addListener(function (request) {
        if (enhanceBeatport) {
            switch (request.event) {
                case 'enhance-off':
                    removeCss();
                    removeHtml();
                    enhanceBeatport = false;
                    break;
            }
        } else {
            if (request.event === 'enhance-on' && !enhanceBeatport) {
                injectCss();
                injectHtml();
                enhanceBeatport = true;
            }
        }
    });
    
    //  Inject CSS via javascript to give it priority over all other CSS loaded on the page.
    function injectCss() {
        var beatportCssUrl = 'css/beatportInject.css';

        var streamusBeatportCss = $("<link>", {
            rel: "stylesheet",
            type: "text/css",
            id: 'streamus-beatport-css',
            href: chrome.extension.getURL(beatportCssUrl)
        });
        streamusBeatportCss.appendTo('head');
        
        //  The beatport CSS url changes during deployment and there's no need to try and load another CSS file because it has been combined into one.
        if (beatportCssUrl.indexOf('min') === -1) {
            var qtipBeatportCss = $("<link>", {
                rel: "stylesheet",
                type: "text/css",
                id: 'qtip-beatport-css',
                href: chrome.extension.getURL('css/jquery.qtip.css')
            });
            qtipBeatportCss.appendTo('head');
        }
    }
    
    function removeCss() {
        $('#streamus-beatport-css').remove();

        var qtipCss = $('#qtip-beatport-css');
        if (qtipCss.length > 0) {
            qtipCss.remove();
        }
    }

    function removeHtml() {
        $('.streamus').remove();
    }
    
    function injectHtml() {
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
    }
});

function injectIconsBasedOnUrl() {
    var currentPageUrl = window.location.href;

    var urlIsBeatportTop100 = currentPageUrl.match(/^.*beatport.com\/.*top-100.*/);
    var urlIsBeatportRelease = currentPageUrl.match(/^.*beatport.com\/.*release.*/);
    var urlIsBeatportFrontPage = currentPageUrl.match(/^.*beatport.com.*/);

    if (urlIsBeatportTop100) {
        injectTop100Icons();
    } else if (urlIsBeatportRelease) {
        injectReleaseIcons();
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