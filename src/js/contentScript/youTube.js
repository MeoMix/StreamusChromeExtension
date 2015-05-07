(function() {
    'use strict';

    function YouTubeContentScript() {
        //  Cached DOM nodes
        var watch8SecondaryActions = null;
        var watchActionPanels = null;
        var addButtonWrapper = null;
        var addButton = null;
        var actionPanel = null;
        var sharePanel = null;
        var sharePanelPlaylistSelect = null;
        var playlistSelect = null;

        //  Data passed from the extension to the content script.
        var contentScriptData = {
            canEnhance: false,
            SyncActionType: null
        };

        this.appendSignInButton = function() {
            while (sharePanel.lastChild) {
                sharePanel.removeChild(sharePanel.lastChild);
            }

            var signInButton = document.createElement('button');
            signInButton.innerHTML = chrome.i18n.getMessage('signIn');
            signInButton.classList.add('yt-uix-button', 'yt-uix-button-size-default', 'yt-uix-button-primary');
            signInButton.onclick = function() {
                chrome.runtime.sendMessage({
                    method: 'signIn'
                });
            };
            sharePanel.appendChild(signInButton);
        }.bind(this);

        //  This content can only be shown once the user is signed in because it is dependent on the user's information.
        this.appendAddPlaylistContent = function() {
            sharePanelPlaylistSelect = document.createElement('div');
            sharePanelPlaylistSelect.id = 'share-panel-playlist-select';
            sharePanelPlaylistSelect.classList.add('share-panel-playlists-container');

            playlistSelect = document.createElement('select');
            playlistSelect.id = 'streamus-playlistSelect';
            playlistSelect.classList.add('yt-uix-form-input-text');
            sharePanelPlaylistSelect.appendChild(playlistSelect);

            var addSongButton = document.createElement('button');
            addSongButton.id = 'streamus-addSongButton';
            addSongButton.classList.add('yt-uix-button', 'yt-uix-button-size-default', 'yt-uix-button-primary');
            addSongButton.innerHTML = chrome.i18n.getMessage('addSong');
            addSongButton.onclick = function() {
                this.innerHTML = chrome.i18n.getMessage('saving');
                this.setAttribute('disabled', 'disabled');

                chrome.runtime.sendMessage({
                    method: 'addSongByUrlToPlaylist',
                    playlistId: playlistSelect.options[playlistSelect.selectedIndex].value,
                    url: window.location.href
                }, function() {
                    this.removeAttribute('disabled');
                    this.innerHTML = chrome.i18n.getMessage('addSong');
                }.bind(this));
            };
            sharePanelPlaylistSelect.appendChild(addSongButton);

            sharePanel.appendChild(sharePanelPlaylistSelect);
        }.bind(this);

        this.setPlaylistSelectOptions = function() {
            chrome.runtime.sendMessage({
                method: 'getPlaylists'
            }, function(response) {
                while (playlistSelect.lastChild) {
                    playlistSelect.removeChild(playlistSelect.lastChild);
                }

                response.playlists.forEach(function(playlist, playlistIndex) {
                    var playlistOption = document.createElement('option');
                    playlistOption.value = playlist.id;
                    playlistOption.innerHTML = playlist.title;
                    playlistSelect.appendChild(playlistOption);

                    if (playlist.active) {
                        playlistSelect.options.selectedIndex = playlistIndex;
                    }
                });

                sharePanelPlaylistSelect.classList.remove('hid');
            });
        }.bind(this);

        this.removeHtml = function() {
            //  Hide the panel if it is active before removing code.
            if (watchActionPanels.style.display !== 'none') {
                addButton.click();
            }

            watch8SecondaryActions.removeChild(addButtonWrapper);
            addButtonWrapper = null;
            addButton = null;

            watchActionPanels.removeChild(actionPanel);
            actionPanel = null;
            sharePanel = null;

            sharePanelPlaylistSelect = null;
            playlistSelect = null;
        }.bind(this);

        this.appendAddToStreamusButton = function() {
            addButtonWrapper = document.createElement('span');
            addButtonWrapper.id = 'streamus-add-button-wrapper';

            addButton = document.createElement('button');
            addButton.classList.add('yt-uix-button', 'yt-uix-button-size-default', 'yt-uix-button-opacity', 'action-panel-trigger');
            addButton.setAttribute('data-trigger-for', 'streamus-action-panel');
            addButtonWrapper.appendChild(addButton);

            var addButtonContent = document.createElement('span');
            addButtonContent.classList.add('yt-uix-button-content');
            addButtonContent.innerHTML = chrome.i18n.getMessage('addToStreamus');
            addButton.appendChild(addButtonContent);

            watch8SecondaryActions = document.getElementById('watch8-secondary-actions');
            watch8SecondaryActions.insertBefore(addButtonWrapper, watch8SecondaryActions.lastChild);
        }.bind(this);

        this.appendStreamusActionPanel = function() {
            actionPanel = document.createElement('div');
            actionPanel.id = 'streamus-action-panel';
            actionPanel.classList.add('action-panel-content', 'yt-uix-expander', 'yt-uix-expander-collapsed', 'hid');
            actionPanel.setAttribute('data-panel-loaded', true);

            sharePanel = document.createElement('div');
            sharePanel.id = 'streamus-share-panel';
            actionPanel.appendChild(sharePanel);

            watchActionPanels = document.getElementById('watch-action-panels');
            watchActionPanels.insertBefore(actionPanel, watchActionPanels.firstChild);
        }.bind(this);

        this.appendHtml = function() {
            this.appendAddToStreamusButton();
            this.appendStreamusActionPanel();

            //  Append or remove HTML dependent on whether the user is signed in (show add playlist functionality) or signed out (show sign in button)
            chrome.runtime.sendMessage({ method: 'getSignedInState' }, function(state) {
                while (sharePanel.lastChild) {
                    sharePanel.removeChild(sharePanel.lastChild);
                }

                if (state.signedIn) {
                    this.appendAddPlaylistContent();
                    this.setPlaylistSelectOptions();
                } else {
                    this.appendSignInButton();
                }
            }.bind(this));
        }.bind(this);

        this.toggleContentScript = function(enable) {
            if (enable) {
                this.appendHtml();
            } else {
                this.removeHtml();
            }
        }.bind(this);

        this.onChromeRuntimeMessage = function(message) {
            //  TODO: Reduce cyclomatic complexity.
            /* jshint ignore:start */
            if (message.action) {
                this[message.action](message.value);
            }

            if (message.event && contentScriptData.canEnhance) {
                //  TODO: It's really minor, but if a playlist changes its index in the collection then this select won't properly update.
                switch (message.event) {
                    case contentScriptData.SyncActionType.Added:
                        var addedOption = document.createElement('option');
                        addedOption.value = message.data.id;
                        addedOption.innerHTML = message.data.title;
                        playlistSelect.appendChild(addedOption);

                        if (message.data.active) {
                            playlistSelect.options.selectedIndex = Array.prototype.indexOf.call(playlistSelect.childNodes, addedOption);
                        }
                        break;
                    case contentScriptData.SyncActionType.Removed:
                        playlistSelect.removeChild(playlistSelect.querySelector('option[value="' + message.data.id + '"]'));
                        break;
                    case contentScriptData.SyncActionType.Updated:
                        var updatedOption = playlistSelect.querySelector('option[value="' + message.data.id + '"]');

                        if (message.data.title) {
                            updatedOption.innerHTML = message.data.title;
                        }

                        if (message.data.active) {
                            playlistSelect.options.selectedIndex = Array.prototype.indexOf.call(playlistSelect.childNodes, updatedOption);
                        }
                        break;
                    case 'signed-in':
                        while (sharePanel.lastChild) {
                            sharePanel.removeChild(sharePanel.lastChild);
                        }

                        this.appendAddPlaylistContent();
                        this.setPlaylistSelectOptions();
                        break;
                    case 'signed-out':
                        this.appendSignInButton();
                        break;
                }
            }
            /* jshint ignore:end */
        }.bind(this);

        this.onGetYouTubeContentScriptDataResponse = function(youTubeContentScriptData) {
            contentScriptData = youTubeContentScriptData;

            if (contentScriptData.canEnhance) {
                //  This code handles the fact that when you navigate from a YouTube search results list to a video
                //  the page does not reload because they use AJAX to load the video page. 
                var isPageLoaded = false;
      
                var observer = new MutationObserver(function(mutations) {
                    var hasPageLoadedClass = mutations[0].target.classList.contains('page-loaded');

                    if (hasPageLoadedClass && !isPageLoaded) {
                        this.appendHtml();
                    }

                    isPageLoaded = hasPageLoadedClass;
                }.bind(this));

                observer.observe(document.querySelector('body'), {
                    attributes: true,
                    attributeFilter: ['class']
                });
            }
        }.bind(this);

        chrome.runtime.onMessage.addListener(this.onChromeRuntimeMessage);
        chrome.runtime.sendMessage({
            method: 'getYouTubeContentScriptData'
        }, this.onGetYouTubeContentScriptDataResponse);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.youTubeContentScript = new YouTubeContentScript();
        });
    } else {
        window.youTubeContentScript = new YouTubeContentScript();
    }
}());