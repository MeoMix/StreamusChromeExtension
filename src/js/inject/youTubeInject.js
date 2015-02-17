//  This code runs on YouTube pages.
$(function () {
    'use strict';
    
	var enhanceYouTube = false;
	var injectData = {
		canEnhance: false,
		SyncActionType: null
	};

	chrome.runtime.sendMessage({ method: 'getYouTubeInjectData' }, function (youTubeInjectData) {
		injectData = youTubeInjectData;

		if (injectData.canEnhance) {
			//  This code handles the fact that when you navigate from a YouTube search results list to a video
			//  the page does not reload because they use AJAX to load the video page. 
			var isFirstLoad = true;
			var waitingForLoad = false;

			var observer = new window.WebKitMutationObserver(function (mutations) {
				if (isFirstLoad) {
					isFirstLoad = false;
					injectHtml();
				}
				else {
					var isPageLoaded = mutations[0].target.classList.contains('page-loaded');

					if (!waitingForLoad && !isPageLoaded) {
						waitingForLoad = true;
					}
					else if (waitingForLoad && isPageLoaded) {
						injectHtml();
						waitingForLoad = false;
					}
				}
			});

			observer.observe(document.querySelector("body"), {
				attributes: true,
				attributeFilter: ["class"]
			});

			enhanceYouTube = true;
		}
	});
	
	chrome.runtime.onMessage.addListener(function (request) {
		if (enhanceYouTube) {
			switch (request.event) {
				case injectData.SyncActionType.Added:
					var playlistOption = $('<option>', {
						value: request.data.id,
						text: request.data.title
					});

					playlistOption.appendTo($('#playlistSelect'));
					break;
				case injectData.SyncActionType.Removed:
					$('#playlistSelect').find('option[value="' + request.data.id + '"]').remove();
					break;
				case injectData.SyncActionType.Updated:
					$('#playlistSelect').find('option[value="' + request.data.id + '"]').text(request.data.title);
					break;
				case 'signed-in':
					$('#streamus-share-panel').empty();
					injectAddPlaylistContent($('#streamus-share-panel'));
					getPlaylistsAndSetSelectOptions();
					break;
				case 'signed-out':
					$('#streamus-share-panel').empty();
					injectSignIn();
					break;
				case 'enhance-off':
					removeHtml();
					enhanceYouTube = false;
					break;
			}
		} else {
			if (request.event === 'enhance-on' && !enhanceYouTube) {
				injectHtml();
				enhanceYouTube = true;
			}
		}
	});

	function injectSignIn(sharePanel) {
		sharePanel.append($('<input>', {
			type: 'button',
			value: chrome.i18n.getMessage('signIn'),
			'class': 'yt-uix-button yt-uix-button-size-default yt-uix-button-primary',
			click: function() {
				chrome.runtime.sendMessage({
					method: "signIn"
				});
			}
		}));
	}
	
	//  This content can only be shown once the user is signed in because it is dependent on the user's information.
	function injectAddPlaylistContent(sharePanel) {
		var sharePanelPlaylistSelect = $('<div>', {
			id: 'share-panel-playlist-select',
			'class': 'share-panel-playlists-container'
		});
		sharePanel.append(sharePanelPlaylistSelect);

		sharePanelPlaylistSelect.append($('<select>', {
			id: 'playlistSelect',
			'class': 'yt-uix-form-input-text',
			'css': {
				'margin-right': '10px'
			}
		}));

		sharePanelPlaylistSelect.append($('<input>', {
			type: 'button',
			value: chrome.i18n.getMessage('addSong'),
			'class': 'yt-uix-button yt-uix-button-size-default yt-uix-button-primary',
			css: {
				'margin-top': '-2px'
			},
			click: function () {
				$(this).val(chrome.i18n.getMessage('saving')).attr('disabled', true);

				var shortlink = $('[rel=shortlink]').attr('href');
				var songId = shortlink.slice(shortlink.lastIndexOf('/') + 1);

				chrome.runtime.sendMessage({
					method: "addYouTubeSongByIdToPlaylist",
					playlistId: $('#playlistSelect').val(),
					songId: songId
				}, function () {
					$(this).removeAttr('disabled').val(chrome.i18n.getMessage('addSong'));
				}.bind(this));
			}
		}));
	}
	
	function getPlaylistsAndSetSelectOptions() {
		chrome.runtime.sendMessage({ method: "getPlaylists" }, function (getPlaylistsResponse) {
			var playlists = getPlaylistsResponse.playlists;

			$('#select-playlist-button').addClass('yt-uix-button-toggled');
			$('#share-panel-playlist-select').removeClass('hid');

			for (var i = 0; i < playlists.length; i++) {
				$('<option>', {
					value: playlists[i].id,
					text: playlists[i].title,
					selected: playlists[i].active
				}).appendTo($('#playlistSelect'));
			}
		});
	}
	
	function removeHtml() {
		//  Hide the panel if it is active before removing code.
		if ($('#action-panel-streamus').is(':visible')) {
			$('#streamus-add-button-wrapper > button').click();
		}

		$('#streamus-add-button-wrapper').remove();
		$('#action-panel-streamus').remove();
	}

	function injectHtml() {
		var addButtonWrapper = $('<span id="streamus-add-button-wrapper">');
		addButtonWrapper.insertBefore($('#watch8-secondary-actions').children(':last'));

		var addButton = $('<button>', {
			'class': 'yt-uix-button yt-uix-button-size-default yt-uix-button-opacity yt-uix-button-has-icon action-panel-trigger yt-uix-button-opacity',
			type: 'button',
			'data-trigger-for': 'action-panel-streamus'
		});

		addButton.append($('<span>', {
			'class': 'yt-uix-button-content',
			text: chrome.i18n.getMessage('addToStreamus')
		}));

		addButton.appendTo(addButtonWrapper);

		var streamusActionPanel = $('<div>', {
			id: 'action-panel-streamus',
			'class': 'action-panel-content yt-uix-expander yt-uix-expander-collapsed hid',
			'data-panel-loaded': true
		});
		
		streamusActionPanel.insertBefore($('#watch-action-panels').children(':first'));

		var sharePanel = $('<div>', {
			id: 'streamus-share-panel',
			'class': 'share-panel'
		});
		sharePanel.appendTo(streamusActionPanel);
		
		//  Append or remove HTML dependent on whether the user is signed in (show add playlist functionality) or signed out (show sign in button)
		chrome.runtime.sendMessage({ method: 'getSignedInState' }, function (state) {
			sharePanel.empty();
			
			if (state.signedIn) {   
				injectAddPlaylistContent(sharePanel);
				getPlaylistsAndSetSelectOptions();
			} else {
				injectSignIn(sharePanel);
			}
		});
	}
});