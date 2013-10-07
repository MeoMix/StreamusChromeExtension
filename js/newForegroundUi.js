$(function() {

    $('#button-play').click(function() {

        var icon = $(this).find('i');

        if (icon.hasClass('icon-play')) {
            icon.removeClass('icon-play').addClass('icon-pause');
        } else {
            icon.removeClass('icon-pause').addClass('icon-play');
        }

    });

    $("input[type='range']").change(function() {
        $(this).parent().find(".progress").css("width", $(this).attr("value") + "%");
    });

})
