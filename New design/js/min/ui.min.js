$(document).ready(function(){
	$("#button-play").toggle(function(){
		$(this).find("i").removeClass("icon-play").addClass("icon-pause");
	},function(){                                                       
		$(this).find("i").removeClass("icon-pause").addClass("icon-play");
	})
	$("#button-playlists, #button-video-mode, #button-stream-repeat, #button-stream-shuffle, #button-stream-radio").click(function(){
		$(this).toggleClass("button-toggle");
	})
	$("#playlists-panel").hide();
	$("#button-playlists").toggle(function(){
		$("#playlists-panel").fadeIn(200,function(){
			$(this).addClass("visible");
		});
	}, function(){                                       
		$("#playlists-panel").removeClass("visible").fadeOut();	
	})
	$("input[type='range']").change(function(){
		$(this).parent().find(".progress").css("width",$(this).attr("value")+"%");
	})
	$("#playlists-panel h3").toggle(function(){
		$(this).find("i").removeClass("icon-caret-down").addClass("icon-caret-right");
		$(this).next().slideUp(200);
	},function(){
		$(this).find("i").addClass("icon-caret-down").removeClass("icon-caret-right");
		$(this).next().slideDown(200);
	})
	$(".search-bar input").focus(function(){
		$(this).parent().find(".dummy").addClass("active");
	}).blur(function(){
		$(this).parent().find(".dummy").removeClass("active");
	})
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
