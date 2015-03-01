//  This code runs on pro.beatport.com domains.
$(function() {
    'use strict';

    var isCodeInjected = false;
    var injectData = {
        canEnhance: false
    };

    //  Find out whether Streamus settings are configured to allow modifying Beatport's HTML.
    chrome.runtime.sendMessage({ method: 'getBeatportInjectData' }, function(beatportInjectData) {
        injectData = beatportInjectData;

        if (injectData.canEnhance) {
            toggleInjectedCode(true);
            isCodeInjected = true;
        }
    });

    //  Listen for Streamus settings changing and toggle injected code.
    chrome.runtime.onMessage.addListener(function(request) {
        if (isCodeInjected) {
            if (request.event === 'enhance-off') {
                toggleInjectedCode(false);
                isCodeInjected = false;
            }
        } else {
            if (request.event === 'enhance-on') {
                toggleInjectedCode(true);
                isCodeInjected = true;
            }
        }
    });    

    //  Pass enable: true in to enable Streamus icons. Pass enable: false in to disable Streamus icons and revert back to original Beatport functionality.

    function toggleStreamusIcons(enable) {
        //  Work within a container because bucket-items are scattered throughout Beatport pages.
        //  Use class*= selector to keep query generic enough to be used across all Beatport pages.
        var container = $('.bucket[class*=tracks]');

        var tracks = container.find('.bucket-items .bucket-item');
        tracks.each(function() {
            var button = $(this).find('[class*=track-play]');

            if (enable) {
                //  Figure out the information needed to find a song on YouTube.
                //  Query will look like "primaryTitle remix artist1 artist2"
                var primaryTitle = $(this).find('[class*=track-primary-title]').text();
                var remix = $(this).find('[class*=track-remixed]').text();
                var artists = $(this).find('[class*=track-artists] a').map(function() {
                    return $(this).text();
                }).get().join(' ');

                var query = primaryTitle + ' ' + remix + ' ' + artists;

                //  Decorate button to indicate it is Streamus-ified, cache query on the button so playAll can read it.
                button.addClass('streamus-button');
                button.data('streamus-query', query);
                //  Namespace the click event so that it can be removed easily in the future.
                button.on('click.streamus', function() {
                    chrome.runtime.sendMessage({
                        method: 'searchAndStreamByQuery',
                        query: $(this).data('streamus-query')
                    });

                    //  Return false to prevent Beatport from playing the track.
                    return false;
                });
            } else {
                button.removeClass('streamus-button');
                button.removeData('streamus-query');
                button.off('click.streamus');
            }
        });

        //  Note that the play all button isn't necessarily within our tracks container depending on the page.
        //  For instance, Top 100 has it outside the container where as Top 10 has it within the container.
        var playAllButton = $('.playable-play-all');

        if (enable) {
            playAllButton.addClass('streamus-button');
            //  Namespace the click event so that it can be removed easily in the future.
            playAllButton.on('click.streamus', function() {
                //  Grab all the stored queries from playTrack buttons.
                var queries = tracks.find('.streamus-button').map(function() {
                    return $(this).data('streamus-query');
                });

                chrome.runtime.sendMessage({
                    method: 'searchAndStreamByQueries',
                    queries: queries.toArray()
                });

                //  Return false to prevent Beatport from playing all tracks.
                return false;
            });
        } else {
            playAllButton.removeClass('streamus-button');
            playAllButton.off('click.streamus');
        }
    }

    //  When the user clicks a link on Beatport - the page doesn't reload since Beatport is a single-page application.
    //  So, monitor the URL for changes and, when detected, re-inject code.

    function toggleMonitorPageChange(enable) {
        var checkUrlInterval = null;

        if (enable) {
            var timeout = 10000; //  Give it 10s to change before they'll need to refresh
            var pollingFrequency = 1000; //  Check every 1s

            //  Filter out streamus links because they obviously can't take the user anywhere.
            $(document).on('click.streamus', 'a[href]', function() {
                var clickedLinkHref = $(this).attr('href');

                //  Stop any previous checks
                clearInterval(checkUrlInterval);

                //  Wait for browser to load and check occassionally until the URL matches or we give up.
                checkUrlInterval = setInterval(function() {
                    var currentLocationHref = window.location.href;

                    //  If they clicked something like /top-100, url will be beatport.com/top-100 so need to match both ways
                    var clickedRoutingLink = clickedLinkHref.charAt(0) === '/';
                    var hrefContainsRoutingLink = clickedRoutingLink && currentLocationHref.indexOf(clickedLinkHref) !== -1;

                    if (currentLocationHref == clickedLinkHref || hrefContainsRoutingLink) {
                        toggleStreamusIcons(true);
                        clearInterval(checkUrlInterval);
                    }

                    timeout -= pollingFrequency;

                    if (timeout <= 0) {
                        clearInterval(checkUrlInterval);
                    }
                }, pollingFrequency);
            });
        } else {
            $(document).off('click.streamus');
            clearInterval(checkUrlInterval);
        }
    }

    function toggleInjectedCode(enable) {
        toggleStreamusIcons(enable);
        toggleMonitorPageChange(enable);
    }
});