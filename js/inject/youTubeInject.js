//  This code runs on YouTube pages.
$(function () {
    //  Inject CSS here to give it priority over all other CSS loaded on the page.
    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = chrome.extension.getURL('css/youTubeInject.css');
    document.head.appendChild(style);

    var addButtonWrapper = $('<span>');
    var youtubeButtonInsertLocation = $('#watch7-secondary-actions');
    addButtonWrapper.insertBefore(youtubeButtonInsertLocation.children(':first'));
    
	var addButton = $('<button>', {
	    'class': 'action-panel-trigger yt-uix-button yt-uix-button-text yt-uix-tooltip',
	    title: chrome.i18n.getMessage("addVideoToStreamus"),
	    type: 'button',
	    role: 'button',
	    'data-button-toggle': true,
	    'data-trigger-for': 'action-panel-streamus',
	    click: function () {
	        //return false;
	    }
	});
	addButton.appendTo(addButtonWrapper);
    var addButtonContent = $('<span>', {
        'class': 'yt-uix-button-content',
        text: chrome.i18n.getMessage("addToStreamus")
    });
    addButtonContent.appendTo(addButton);

	chrome.runtime.sendMessage({
		method: "getYouTubeInjectClicked"
	}, function(response) {
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
    
    var watchActionsSharePanel = $('<div>', {

    });
    watchActionsSharePanel.appendTo(streamusActionPanel);

    var sharePanel = $('<div>', {
        'class': 'share-panel'
    });
    sharePanel.appendTo(watchActionsSharePanel);
    
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
    
    //var selectFolderButton = $('<button>', {
    //    type: 'button',
    //    'class': 'share-panel-services yt-uix-button-toggled yt-uix-button yt-uix-button-text',
    //    'data-button-toggle': true,
    //    role: 'button',
    //    onclick: function() {
    //        return false;
    //    }
    //});
    //selectFolderButton.appendTo(sharePanelMainButtons);
    
    //var selectSteamContent = $('<span>', {
    //    'class': 'yt-uix-button-content',
    //    text: chrome.i18n.getMessage("selectFolder")
    //});
    
    //selectSteamContent.appendTo(selectFolderButton);
    
    //var sharePanelFolderSelect = $('<div>', {
    //    'class': 'share-panel-folders-container'
    //});
    //sharePanelFolderSelect.appendTo(sharePanel);

    //var folderSelect = $('<select>', {
    //    id: 'folderSelect',
    //    'class': 'yt-uix-form-input-text share-panel-url'
    //});
    //folderSelect.appendTo(sharePanelFolderSelect);
    
    var sharePanelPlaylistSelect = $('<div>', {
        'class': 'share-panel-playlists-container'
    });
    sharePanelPlaylistSelect.appendTo(sharePanel);
    
    var selectPlaylistButton = $('<button>', {
        type: 'button',
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
        text: chrome.i18n.getMessage("selectPlaylist")
    });

    selectPlaylistContent.appendTo(selectPlaylistButton);

    var successEventNotification = $('<div>', {
        id: 'successEventNotification',
        text: chrome.i18n.getMessage("videoAddSuccess"),
        'class': 'eventNotification'
    });
    successEventNotification.appendTo(sharePanelMainButtons);
    
    var errorEventNotification = $('<div>', {
        id: 'errorEventNotification',
        text: chrome.i18n.getMessage("errorEncountered"),
        'class': 'eventNotification'
    });
    errorEventNotification.appendTo(sharePanelMainButtons);

    var playlistSelect = $('<select>', {
        id: 'playlistSelect',
        'class': 'yt-uix-form-input-text share-panel-url'
    });

    playlistSelect.appendTo(sharePanelPlaylistSelect);

    var videoAddButton = $('<input>', {
        type: 'button',
        value: chrome.i18n.getMessage("addVideo"),
        title: chrome.i18n.getMessage("addVideo"),
        id: 'streamusVideoAddButton',
        'class': 'yt-uix-button yt-uix-tooltip',
        click: function () {

            $(this).val(chrome.i18n.getMessage("working"));
            $(this).attr('disabled', true);

            var match = document.URL.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.*?\&v=)([^#\&\?]*).*/);
            var videoId = (match && match[2].length === 11) ? match[2] : null;

            var playlistId = playlistSelect.val();

            var self = this;
            chrome.runtime.sendMessage({
                method: "addVideoByIdToPlaylist",
                playlistId: playlistId,
                videoId: videoId
            }, function (response) {
                
                if (response.result === 'success') {
                    $(self).removeAttr('disabled');
                    $(self).val(chrome.i18n.getMessage("addVideo"));
                    successEventNotification.fadeIn().css("display", "inline-block");

                    setTimeout(function() {
                        successEventNotification.fadeOut();
                    }, 3000);
                } else {
                    $(self).removeAttr('disabled');
                    $(self).val(chrome.i18n.getMessage("addVideo"));
                    errorEventNotification.fadeIn().css("display", "inline-block");
                    setTimeout(function () {
                        errorEventNotification.fadeOut();
                    }, 3000);
                }


            });
        }
    });
    videoAddButton.appendTo(sharePanelPlaylistSelect);

    //selectFolderButton.click(function () {
    //    sharePanelFolderSelect.removeClass('hid');

    //    selectPlaylistButton.removeClass('yt-uix-button-toggled');
    //    selectPlaylistButton.addClass('yt-uix-button');
    //    sharePanelPlaylistSelect.addClass('hid');
    //});
    
    selectPlaylistButton.click(function () {
        sharePanelPlaylistSelect.removeClass('hid');

        //selectFolderButton.addClass('yt-uix-button');
        //selectFolderButton.removeClass('yt-uix-button-toggled');
        //sharePanelFolderSelect.addClass('hid');
    });

    chrome.runtime.sendMessage({ method: "getFolders" }, function (getFoldersResponse) {

        var folders = getFoldersResponse.folders;

        if (folders.length === 1) {
   
            //selectFolderButton.removeClass('yt-uix-button-toggled');
            //sharePanelFolderSelect.addClass('hid');
            
            selectPlaylistButton.addClass('yt-uix-button-toggled');
            sharePanelPlaylistSelect.removeClass('hid');

            //  TODO: Make sure this works after refactor
            for (var i = 0; i < folders[0].playlists.length; i++) {
                $('<option>', {
                    value: folders[0].playlists[i].id,
                    text: folders[0].playlists[i].title
                }).appendTo(playlistSelect);
            }
            
        }

        //_.each(folders, function (folder) {

        //    var folderOption = $('<option>', {
        //        value: folder.id,
        //        text: folder.title
        //    });

        //    folderOption.appendTo(folderSelect);
        //});
    });
    
    chrome.runtime.onMessage.addListener(function (request) {
        switch(request.event) {
            case 'add':
                var playlistOption = $('<option>', {
                    value: request.data.id,
                    text: request.data.title
                });

                playlistOption.appendTo(playlistSelect);
                break;
            case 'remove':
                playlistSelect.find('option[value="' + request.data.id + '"]').remove();
                break;
            case 'rename':                
                playlistSelect.find('option[value="' + request.data.id + '"]').text(request.data.title);
                break;
            default:
                console.error("Unhandled request", request);
                break;
        }
  });

});



