//  Inject CSS here to give it priority over all other CSS loaded on the page.
var style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = chrome.extension.getURL('css/beatportInject.css');
document.head.appendChild(style);

//  This code runs on beatport.com domains.
$(function () {
    'use strict';

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

    function injectIconsBasedOnUrl() {

        var currentPageUrl = window.location.href;

        var urlIsBeatportTop100 = currentPageUrl.match(/^.*beatport.com\/.*top-100.*/);
        var urlIsBeatportFrontPage = currentPageUrl.match(/^.*beatport.com.*/);

        if (urlIsBeatportTop100) {
            injectTop100Icons();
        }
        else if (urlIsBeatportFrontPage) {
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
        _.each(top10TracksPlayButtons, function (button) {

            var trackName = $(button).data('item-name');
            var trackArtists = $(button).closest('.line').find('.itemRenderer-list').text();

            var streamusPlayButton = buildStreamusPlayButton(trackName, trackArtists);
            $(button).before(streamusPlayButton);
        });

    }

    function injectTop100Icons() {

        appendPlayAllButtonBeforeSelector('a.btn-play[data-trackable="Play All"]');

        var playButtons = $('.btn-play[data-item-name]');
        if (playButtons.length === 0) throw "Failed to find play buttons";

        //  Inject a playVideo icon next to each icon on the page. This will stream the current item.
        _.each(playButtons, function (button) {

            var trackName = $(button).data('item-name');
            var trackArtists = $(button).closest('tr.track-grid-content').find('.secondColumn').next().text();

            var streamusPlayButton = buildStreamusPlayButton(trackName, trackArtists);
            $(button).before(streamusPlayButton);
        });

    }

    function buildStreamusPlayButton(trackName, trackArtists) {

        var query = trackName.trim() + ' ' + trackArtists.replace(',', '').trim();

        var streamusPlayButton = $('<a>', {
            'class': 'streamus btn-play',
            'role': 'button',
            'href': 'javascript:void(0)',
            'data-query': query,
            'data-toggle': 'tooltip',
            'title': chrome.i18n.getMessage("playInStreamus"),
            click: function () {

                var clickedItemQuery = $(this).data('query');

                chrome.runtime.sendMessage({
                    method: "searchAndStreamByQuery",
                    query: clickedItemQuery
                });

            }
        });

        streamusPlayButton.tooltip();
        var streamusLogoIcon = buildStreamusLogoIcon();

        return streamusPlayButton.add(streamusLogoIcon);
    }

    function appendPlayAllButtonBeforeSelector(selector) {

        var selectorToAppendBefore = $(selector);
        if (selectorToAppendBefore.length === 0) throw "Failed to find selector: " + selector;

        //  Find the playAll button at the top of the page and inject a Streamus 'Add All To Stream' button
        var streamusPlayAllButton = $('<a>', {
            'class': 'streamus btn-play',
            'role': 'button',
            'href': 'javascript:void(0)',
            'title': chrome.i18n.getMessage("playAllInStreamus"),
            click: function () {

                var itemQueries = _.map($('.streamus.btn-play[data-query]'), function (playButton) {
                    var itemQuery = $(playButton).data('query');
                    return itemQuery;
                });

                chrome.runtime.sendMessage({
                    method: "searchAndStreamByQueries",
                    queries: itemQueries
                });

            }
        });

        var streamusLogoIcon = buildStreamusLogoIcon();

        selectorToAppendBefore.before(streamusPlayAllButton.add(streamusLogoIcon));
        streamusPlayAllButton.tooltip();
    }

    function buildStreamusLogoIcon() {
        var streamusLogoIcon = $('<a>', {
            'class': 'streamus btn-queue',
            'role': 'button',
            'href': 'javascript:void(0)'
        });

        return streamusLogoIcon;
    }

});