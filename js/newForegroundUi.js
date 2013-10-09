$(function() {

    $("input[type='range']").change(function() {
        $(this).parent().find(".progress").css("width", $(this).attr("value") + "%");
    });

})
