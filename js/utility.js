define([
    'dataSourceType'
], function (DataSourceType) {
    'use strict';

    var Utility = Backbone.Model.extend({

        //  TODO: Unsure if I even want this functionality.
        //  If there are a ton of elements which need to scroll all under a given root element, allow for event delegation
        scrollChildElements: function (parent, childElementSelector) {

            $(parent).on('mouseover', childElementSelector, function () {

                var distanceToMove = $(this).outerWidth() - $(this).parent().width();

                if (distanceToMove > 0) {
                    //  NOTE: Don't use translateX here because text will get blurry if you translate it.
                    $(this).transit({
                        'margin-left': -1 * distanceToMove
                    }, 8 * distanceToMove, 'linear');

                }

            });

            $(parent).on('mouseout', childElementSelector, function () {

                $(this).transitionStop(true).transit({
                    'margin-left': 0
                });

            });

        },

        //  TODO: How do I test something like this?
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

        //  Converts an ISO8061 format (i.e: PT1H3M52S) to numeric representation in seconds.
        iso8061DurationToSeconds: function (isoDuration) {
            var hoursMatch = isoDuration.match(/(\d+)H/);
            var hours = parseInt(hoursMatch ? hoursMatch[1] : 0);

            var minutesMatch = isoDuration.match(/(\d+)M/);
            var minutes = parseInt(minutesMatch ? minutesMatch[1] : 0);

            var secondsMatch = isoDuration.match(/(\d+)S/);
            var seconds = parseInt(secondsMatch ? secondsMatch[1] : 0);

            var secondsDuration = seconds + (60 * minutes) + (60 * 60 * hours);
            return secondsDuration;
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
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&qot;');

            return safeString;
        },

        /**
        * Cleanse method inspired by the Chrome Last.fm Scrobbler extension
        * by David Sabata (https://github.com/david-sabata/Chrome-Last.fm-Scrobbler)
        */
        cleanseVideoTitle: function (title) {

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
        },

        //  http://stackoverflow.com/questions/11919065/sort-an-array-by-the-levenshtein-distance-with-best-performance-in-javascript
        getLevenshteinDistance: function (s, t) {
            //  2d matrix
            var d = [];

            //  Step 1
            var n = s.length;
            var m = t.length;

            if (n == 0) return m;
            if (m == 0) return n;

            //  Create an array of arrays in javascript (a descending loop is quicker)
            for (var i = n; i >= 0; i--) d[i] = [];

            //  Step 2
            for (var i = n; i >= 0; i--) d[i][0] = i;
            for (var j = m; j >= 0; j--) d[0][j] = j;

            //  Step 3
            for (var i = 1; i <= n; i++) {
                var s_i = s.charAt(i - 1);

                //  Step 4
                for (var j = 1; j <= m; j++) {

                    //  Check the jagged ld total so far
                    if (i == j && d[i][j] > 4) return n;

                    var t_j = t.charAt(j - 1);
                    var cost = (s_i == t_j) ? 0 : 1; // Step 5

                    //  Calculate the minimum
                    var mi = d[i - 1][j] + 1;
                    var b = d[i][j - 1] + 1;
                    var c = d[i - 1][j - 1] + cost;

                    if (b < mi) mi = b;
                    if (c < mi) mi = c;

                    d[i][j] = mi; // Step 6

                    //  Damerau transposition
                    if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
                        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
                    }
                }
            }

            // Step 7
            return d[n][m];
        }
    });

    return new Utility;
});