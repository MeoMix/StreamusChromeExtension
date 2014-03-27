define({
    setTitleTooltip: function(title) {
        //  Only show the tooltip if the title is overflowing.
        var textOverflows = title[0].offsetWidth < title[0].scrollWidth;

        if (textOverflows) {
            title.qtip();
        } else {
            title.attr('title', '');

            //  If Qtip has already been applied to the element - remove it.
            var qtipApi = title.qtip('api');
            
            if (!_.isUndefined(qtipApi)) {
                qtipApi.destroy(true);
            }

        }
    }
});