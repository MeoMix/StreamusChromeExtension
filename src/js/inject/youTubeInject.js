//  This code runs on YouTube pages.
$(function () {
	'use strict';

	//  Inject CSS here to give it priority over all other CSS loaded on the page.
	var style = document.createElement('link');
	style.rel = 'stylesheet';
	style.type = 'text/css';
	style.href = chrome.extension.getURL('css/youTubeInject.css');
	document.head.appendChild(style);

	var isFirstLoad = true;
	var waitingForLoad = false;

	var observer = new window.WebKitMutationObserver(function (mutations) {
		if (isFirstLoad) {
			isFirstLoad = false;
			injectStreamusHtml();
		}
		else {
			var isPageLoaded = mutations[0].target.classList.contains('page-loaded');
	
			if (!waitingForLoad && !isPageLoaded) {
				waitingForLoad = true;
			}
			else if (waitingForLoad && isPageLoaded) {
				injectStreamusHtml();
				waitingForLoad = false;
			}
		}
	});

	observer.observe(document.querySelector("body"), {
		attributes: true,
		attributeFilter: ["class"]
	});
	
	function getSignedInState(callback) {
		chrome.runtime.sendMessage({ method: 'getSignedInState' }, callback);
	}
   
	function injectSignIn(sharePanel) {
		var signInNotification = $('<span>', {
			id: 'sign-in-notification',
			/* TODO: i18n */
			text: 'You must be signed in to use this functionality.'
		});

		sharePanel.append(signInNotification);

		var streamusSignInButton = $('<input>', {
			type: 'button',
			value: 'Sign in to Streamus',
			id: 'sign-in-button',
			'class': 'yt-uix-button yt-uix-tooltip streamus-button',
			click: function() {
				chrome.runtime.sendMessage({
					method: "signIn"
				});
			}
		});

		sharePanel.append(streamusSignInButton);
	}
	
	//  This content can only be shown once the user is signed in because it is dependent on the user's information.
	function injectAddPlaylistContent(sharePanel) {
		var sharePanelButtons = $('<div>', {
			id: 'streamus-panel-buttons',
			'class': 'share-panel-buttons'
		});
		sharePanelButtons.appendTo(sharePanel);

		var sharePanelMainButtons = $('<span>', {
			'class': 'share-panel-main-buttons yt-uix-button-group',
			'data-button-toggle-group': 'share-panels'
		});
		sharePanelMainButtons.appendTo(sharePanelButtons);

		var sharePanelPlaylistSelect = $('<div>', {
			id: 'share-panel-playlist-select',
			'class': 'share-panel-playlists-container'
		});
		sharePanelPlaylistSelect.appendTo(sharePanel);

		var selectPlaylistButton = $('<button>', {
			type: 'button',
			id: 'select-playlist-button',
			'class': 'share-panel-services yt-uix-button yt-uix-button yt-uix-button-text',
			'data-button-toggle': true,
			role: 'button',
			onclick: function () {
				return false;
			}
		});

		selectPlaylistButton.appendTo(sharePanelMainButtons);
		var selectPlaylistContent = $('<span>', {
			'class': 'yt-uix-button-content',
			text: chrome.i18n.getMessage('selectPlaylist')
		});

		selectPlaylistContent.appendTo(selectPlaylistButton);

		var successEventNotification = $('<div>', {
			id: 'successEventNotification',
			text: chrome.i18n.getMessage('songAddSuccess'),
			'class': 'eventNotification'
		});
		successEventNotification.appendTo(sharePanelMainButtons);

		var errorEventNotification = $('<div>', {
			id: 'errorEventNotification',
			text: chrome.i18n.getMessage('errorEncountered'),
			'class': 'eventNotification'
		});
		errorEventNotification.appendTo(sharePanelMainButtons);

		var playlistSelect = $('<select>', {
			id: 'playlistSelect',
			'class': 'yt-uix-form-input-text share-panel-url'
		});

		playlistSelect.appendTo(sharePanelPlaylistSelect);

		var streamusAddButton = $('<input>', {
			type: 'button',
			value: chrome.i18n.getMessage('addSong'),
			title: chrome.i18n.getMessage('addSong'),
			id: 'streamusAddButton',
			'class': 'yt-uix-button yt-uix-tooltip streamus-button',
			click: function () {
				$(this).val(chrome.i18n.getMessage('working') + '...');
				$(this).attr('disabled', true);

				var match = document.URL.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.*?\&v=)([^#\&\?]*).*/);
				var songId = (match && match[2].length === 11) ? match[2] : null;

				var playlistId = playlistSelect.val();

				var self = this;
				chrome.runtime.sendMessage({
					method: "addYouTubeSongByIdToPlaylist",
					playlistId: playlistId,
					songId: songId
				}, function (response) {
					if (response.result === 'success') {
						$(self).removeAttr('disabled');
						$(self).val(chrome.i18n.getMessage('addSong'));
						successEventNotification.fadeIn().css("display", "inline-block");

						setTimeout(function () {
							successEventNotification.fadeOut();
						}, 3000);
					} else {
						$(self).removeAttr('disabled');
						$(self).val(chrome.i18n.getMessage('addSong'));
						errorEventNotification.fadeIn().css("display", "inline-block");
						setTimeout(function () {
							errorEventNotification.fadeOut();
						}, 3000);
					}
				});
			}
		});
		streamusAddButton.appendTo(sharePanelPlaylistSelect);

		selectPlaylistButton.click(function () {
			sharePanelPlaylistSelect.removeClass('hid');
		});
	}
	
	function getPlaylistsAndSetSelectOptions() {
		chrome.runtime.sendMessage({ method: "getPlaylists" }, function (getPlaylistsResponse) {
			var playlists = getPlaylistsResponse.playlists;

			$('#select-playlist-button').addClass('yt-uix-button-toggled');
			$('#share-panel-playlist-select').removeClass('hid');

			for (var i = 0; i < playlists.length; i++) {
				$('<option>', {
					value: playlists[i].id,
					text: playlists[i].title
				}).appendTo($('#playlistSelect'));
			}
		});
	}

	function injectStreamusHtml() {
		var addButtonWrapper = $('<span>');
		var youtubeButtonInsertLocation = $('#watch7-secondary-actions');
		addButtonWrapper.insertBefore(youtubeButtonInsertLocation.children(':first'));

		var addButton = $('<button>', {
			'class': 'action-panel-trigger yt-uix-button yt-uix-button-text yt-uix-tooltip',
			title: chrome.i18n.getMessage('addToStreamus'),
			type: 'button',
			role: 'button',
			'data-button-toggle': true,
			'data-trigger-for': 'action-panel-streamus'
		});
		addButton.appendTo(addButtonWrapper);
		var addButtonContent = $('<span>', {
			'class': 'yt-uix-button-content',
			text: chrome.i18n.getMessage('addToStreamus')
		});
		addButtonContent.appendTo(addButton);

		chrome.runtime.sendMessage({
			method: "getYouTubeInjectClicked"
		}, function (response) {
			if (!response.result) {
				addButton.addClass("notClickedYet");
			}
		});

		var streamusActionPanel = $('<div>', {
			id: 'action-panel-streamus',
			'class': 'action-panel-content',
			'data-panel-loaded': true,
			css: {
				display: 'none',
				padding: '18px 20px',
				width: '600px'
			}
		});
		
		var youtubePanelInsertLocation = $('#watch7-action-panels');
		streamusActionPanel.insertBefore(youtubePanelInsertLocation.children(':first'));

		var sharePanel = $('<div>', {
			id: 'streamus-share-panel',
			'class': 'share-panel'
		});
		sharePanel.appendTo(streamusActionPanel);
		
		//  Append or remove HTML dependent on whether the user is signed in (show add playlist functionality) or signed out (show sign in button)
		getSignedInState(function (state) {
			sharePanel.empty();
			
			if (state.signedIn) {   
				injectAddPlaylistContent(sharePanel);
				getPlaylistsAndSetSelectOptions();
			} else {
				injectSignIn(sharePanel);
			}
		});

		chrome.runtime.onMessage.addListener(function (request) {
			switch (request.event) {
				case 'add':
					var playlistOption = $('<option>', {
						value: request.data.id,
						text: request.data.title
					});

					playlistOption.appendTo($('#playlistSelect'));
					break;
				case 'remove':
					$('#playlistSelect').find('option[value="' + request.data.id + '"]').remove();
					break;
				case 'rename':
					$('#playlistSelect').find('option[value="' + request.data.id + '"]').text(request.data.title);
					break;
				case 'signed-in':
					$('#streamus-share-panel').empty();
					injectAddPlaylistContent($('#streamus-share-panel'));
					getPlaylistsAndSetSelectOptions();
					break;
				case 'sign-out':
					$('#streamus-share-panel').empty();
					injectSignIn();
					break;
				default:
					console.error("Unhandled request", request);
					break;
			}
		});
	}
});