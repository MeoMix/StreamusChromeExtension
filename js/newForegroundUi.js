$(function() {

    $('#button-play').click(function() {

        var icon = $(this).find('i');

        if (icon.hasClass('icon-play')) {
            icon.removeClass('icon-play').addClass('icon-pause');
        } else {
            icon.removeClass('icon-pause').addClass('icon-play');
        }

    });

    $("#button-playlists, #button-video-mode, #button-stream-repeat, #button-stream-shuffle, #button-stream-radio").click(function() {
        $(this).toggleClass("button-toggle");
    });

    $("#playlists-panel").hide();
    
    $('#button-playlists').click(function () {

        var playlistsPanel = $('#playlists-panel');

        var playlistsPanelIsVisible = playlistsPanel.hasClass('visible');

        if (playlistsPanelIsVisible) {
            playlistsPanel.removeClass("visible").fadeOut();
        } else {
            playlistsPanel.fadeIn(200, function () {
                $(this).addClass("visible");
            });
        }

    });

    $("input[type='range']").change(function() {
        $(this).parent().find(".progress").css("width", $(this).attr("value") + "%");
    });

    $('#playlists-panel h3').click(function() {

        var icon = $(this).find('i');
        var isExpanded = icon.hasClass('icon-caret-down');
        
        if (isExpanded) {
            icon.removeClass("icon-caret-down").addClass("icon-caret-right");
            $(this).next().slideUp(200);
        } else {
            icon.addClass("icon-caret-down").removeClass("icon-caret-right");
            $(this).next().slideDown(200);
        }


    });

    $(".search-bar input").focus(function() {
        $(this).parent().find(".dummy").addClass("active");
    }).blur(function() {
        $(this).parent().find(".dummy").removeClass("active");
    });

	$("#button-back, #search").hide();

	$("#button-add-videos").click(function(){  
		$("#button-playlists, #playlists").fadeOut();
		$("#button-back, #search").fadeIn();
		$(".search-bar input").focus();
	});

	$("#button-back").click(function(){               
		$("#button-back, #search").fadeOut();
		$("#button-playlists, #playlists").fadeIn();
	});
	
})
