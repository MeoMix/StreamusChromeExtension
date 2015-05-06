(function() {
    'use strict';

    var BeatportContentScript = function() {
        this.pageLoadObserver = null;

        function onTrackPlayButtonClick(event) {
            //  Prevent Beatport from playing the track.
            event.stopPropagation();

            chrome.runtime.sendMessage({
                method: 'searchAndStreamByQuery',
                query: event.target.dataset.streamusQuery
            });
        }

        function onPlayAllButtonClick(event) {
            //  Prevent Beatport from playing all tracks.
            event.stopPropagation();

            //  TODO: Prefer to not have to re-find tracks by passing them into the function, but
            //  it's tricky because I'd need to use a 'bind' which gets hard with removeEventListener.
            var container = document.querySelector('.bucket[class*=tracks]');
            var streamusButtons = container.querySelectorAll('.bucket-items .bucket-item .streamusButton');

            //  Grab all the stored queries from playTrack buttons.
            var queries = [];
            for (var index = 0; index < streamusButtons.length; index++) {
                queries.push(streamusButtons[index].dataset.streamusQuery);
            }

            chrome.runtime.sendMessage({
                method: 'searchAndStreamByQueries',
                queries: queries
            });
        }

        //  Take a given track element and parse its children for information needed to query YouTube for corresponding song.
        this.getQueryFromTrack = function(track) {
            //  Figure out the information needed to find a song on YouTube.
            //  Query will look like "primaryTitle remix artist1 artist2"
            var primaryTitle = track.querySelector('[class*=track-primary-title]').textContent;
            var remix = track.querySelector('[class*=track-remixed]').textContent;

            var artistsNodeList = track.querySelectorAll('[class*=track-artists] a');
            var artists = [];
            for (var artistNodeIndex = 0; artistNodeIndex < artistsNodeList.length; artistNodeIndex++) {
                artists.push(artistsNodeList[artistNodeIndex].textContent);
            }

            var query = primaryTitle;
            //  Original Mix can mess up YouTube queries since songs won't always have that value.
            if (remix !== 'Original Mix') {
                query = ' ' + remix;
            }
            query += ' ' + artists.join(' ');

            return query;
        }.bind(this);

        //  Pass enable: true in to enable Streamus icons. Pass enable: false in to disable Streamus icons and revert back to original Beatport functionality.
        this.toggleStreamusIcons = function(enable) {
            //  Work within a container because bucket-items are scattered throughout Beatport pages.
            //  Use class*= selector to keep query generic enough to be used across all Beatport pages.
            var container = document.querySelector('.bucket[class*=tracks]');
            var tracks = container.querySelectorAll('.bucket-items .bucket-item');

            for (var trackIndex = 0; trackIndex < tracks.length; trackIndex++) {
                var track = tracks[trackIndex];
                var button = track.querySelector('.icon[class*=track-play]');

                if (enable) {
                    var query = this.getQueryFromTrack(track);

                    //  Decorate button to indicate it is Streamus-ified, cache query on the button so playAll can read it.
                    button.classList.add('streamusButton');
                    button.dataset.streamusQuery = query;
                    button.addEventListener('click', onTrackPlayButtonClick);
                } else {
                    button.classList.remove('streamusButton');
                    delete button.dataset.streamusQuery;
                    button.removeEventListener('click', onTrackPlayButtonClick);
                }
            }

            //  The play all button isn't necessarily within our tracks container depending on the page.
            //  For instance, Top 100 has it outside the container where as Top 10 has it within the container.
            var playAllButton = document.querySelector('.playable-play-all');

            if (enable) {
                playAllButton.classList.add('streamusButton');
                playAllButton.addEventListener('click', onPlayAllButtonClick);
            } else {
                playAllButton.classList.remove('streamusButton');
                playAllButton.removeEventListener('click', onPlayAllButtonClick);
            }
        }.bind(this);

        //  When the user clicks a link on Beatport - the page doesn't reload since Beatport is a single-page application.
        //  So, watch for a loading class being added and then removed. The new page is loaded once the class has been removed.
        this.toggleObservePageLoad = function(enable) {
            if (enable) {
                this.pageLoadObserver = new MutationObserver(function(mutations) {
                    var isPageLoading = mutations[0].target.classList.contains('loading');

                    if (!isPageLoading) {
                        this.toggleStreamusIcons(true);
                    }
                }.bind(this));

                this.pageLoadObserver.observe(document.querySelector('header'), {
                    attributes: true,
                    attributeFilter: ['class']
                });
            } else {
                if (this.pageLoadObserver !== null) {
                    this.pageLoadObserver.disconnect();
                }
            }
        }.bind(this);

        this.toggleContentScript = function(enable) {
            this.toggleStreamusIcons(enable);
            this.toggleObservePageLoad(enable);
        }.bind(this);

        //  Find out whether Streamus settings are configured to allow modifying Beatport's HTML.
        this.getContentScriptData = function() {
            chrome.runtime.sendMessage({
                method: 'getBeatportContentScriptData'
            }, function(contentScriptData) {
                this.toggleContentScript(contentScriptData.canEnhance);
            }.bind(this));
        }.bind(this);

        this.onChromeRuntimeMessage = function(message) {
            this[message.action](message.value);
        }.bind(this);

        this.getContentScriptData();
        //  Listen for Streamus settings changing and toggle content script code.
        chrome.runtime.onMessage.addListener(this.onChromeRuntimeMessage);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.beatportContentScript = new BeatportContentScript();
        });
    } else {
        window.beatportContentScript = new BeatportContentScript();
    }
}());