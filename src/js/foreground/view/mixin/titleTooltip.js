define({
    setTitleTooltip: function(title) {
        //  Only show the tooltip if the title is overflowing.
        var titleOverflows = title[0].offsetWidth < title[0].scrollWidth;

        if (titleOverflows) {
            title.qtip();
        } else {
            title.attr('title', '');
        }
    }
});