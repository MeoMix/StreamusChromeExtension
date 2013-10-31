define({

    //  If there are a ton of elements which need to scroll all under a given root element, allow for event delegation
    scrollChildElements: function (parent, childElementSelector) {

        $(parent).on('mouseover', childElementSelector, function () {

            var distanceToMove = $(this).outerWidth() - $(this).parent().width();

            $(this).transit({
                'margin-left': '-' + distanceToMove + 'px'
            }, {
                //  Just a feel good value; scales as the text gets longer
                duration: 15 * distanceToMove
            });

        });

        $(parent).on('mouseout', childElementSelector, function () {

            $(this).transitionStop(true).transit({
                'margin-left': 0
            });

        });

    },

    //  http://stackoverflow.com/questions/16247825/fetch-z-random-items-from-array-of-size-n-in-z-time
    getRandomNonOverlappingNumbers: function (numbersDesired, maxNumberToUse) {
        var i,
        array = [],
        store = {},
        result = [],
        undef,
        length;

        for (i = 0; i < maxNumberToUse; i += 1) {
            array.push(i);
        }

        length = array.length;

        if (numbersDesired > length) {
            numbersDesired = length;
        }

        i = 0;
        while (i < numbersDesired) {
            var rnd = Math.floor(Math.random() * length);

            if (store[rnd] === undef) {
                result[i] = store[rnd] = array[rnd];
                i += 1;
            }
        }

        return result;
    },
    
    //  Takes a time in seconds and converts it to a displayable format of H:mm:ss or mm:ss.
    prettyPrintTime: function (timeInSeconds) {
        if (isNaN(timeInSeconds)) {
            timeInSeconds = 0;
        }

        var hours = Math.floor(timeInSeconds / 3600);
        var remainingSeconds = timeInSeconds % 3600;

        var minutes = Math.floor(remainingSeconds / 60);
        remainingSeconds = remainingSeconds % 60;

        //  These lines ensure two-digits
        if (minutes < 10) {
            minutes = "0" + minutes;
        }

        if (remainingSeconds < 10) {
            remainingSeconds = "0" + remainingSeconds;
        }

        var timeString = minutes + ':' + remainingSeconds;

        if (hours > 0) {
            timeString = hours + ':' + timeString;
        }

        return timeString;
    },
    
    //  Takes a URL and returns parsed URL information such as schema and video id if found inside of the URL.
    parseVideoIdFromUrl: function (url) {
        var videoId = null;

        var match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.*?\&v=)([^#\&\?]*).*/);
        if (match && match[2].length === 11) {
            videoId = match[2];
        }

        return videoId;
    },
    
    htmlEscape: function (unsafeString) {
        var safeString = unsafeString
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");

        return safeString;
    },
    
    /**
    * Cleanse method inspired by the Chrome Last.fm Scrobbler extension
    * by David Sabata (https://github.com/david-sabata/Chrome-Last.fm-Scrobbler)
    *
    * @param {String} artist
    * @param {String} title
    */
    cleanseVideoTitle: function(title) {

        title = $.trim(title);
        title = title.replace(/\s*\*+\s?\S+\s?\*+$/, ''); // **NEW**
        title = title.replace(/\s*\[[^\]]+\]$/, ''); // [whatever]
        title = title.replace(/\s*\([^\)]*version\)$/i, ''); // (whatever version)
        title = title.replace(/\s*\.(avi|wmv|mpg|mpeg|flv)$/i, ''); // video extensions
        title = title.replace(/\s*(of+icial\s*)?(music\s*)?video/i, ''); // (official)? (music)? video
        title = title.replace(/\s*(ALBUM TRACK\s*)?(album track\s*)/i, ''); // (ALBUM TRACK)
        title = title.replace(/\s*\(\s*of+icial\s*\)/i, ''); // (official)
        title = title.replace(/\s*\(\s*[0-9]{4}\s*\)/i, ''); // (1999)
        title = title.replace(/\s+\(\s*(HD|HQ)\s*\)$/, ''); // HD (HQ)
        title = title.replace(/\s+(HD|HQ)\s*$/, ''); // HD (HQ)
        title = title.replace(/\s*video\s*clip/i, ''); // video clip
        title = title.replace(/\s+\(?live\)?$/i, ''); // live
        title = title.replace(/\(\s*\)/, ''); // Leftovers after e.g. (official video)
        title = title.replace(/\(.*lyrics?\)/i, ''); // (with lyrics)
        title = title.replace(/\s*with\s+lyrics?\s*$/i, ''); // with lyrics
        title = title.replace(/^(|.*\s)"(.*)"(\s.*|)$/, '$2'); // Artist - The new "Track title" featuring someone
        title = title.replace(/^(|.*\s)'(.*)'(\s.*|)$/, '$2'); // 'Track title'
        title = title.replace(/^[\/\s,:;~-\s"]+/, ''); // trim starting white chars and dash
        title = title.replace(/[\/\s,:;~-\s"\s!]+$/, ''); // trim trailing white chars and dash 

        return title;
    }

});