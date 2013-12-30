define(function () {
    'use strict';

    var Utility = Backbone.Model.extend({

        //  Takes a time in seconds and converts it to something human-readable in the format of H:mm:ss or mm:ss.
        prettyPrintTime: function (timeInSeconds) {
            if (isNaN(timeInSeconds)) {
                timeInSeconds = 0;
            }

            var hours = Math.floor(timeInSeconds / 3600);
            var remainingSeconds = timeInSeconds % 3600;

            var minutes = Math.floor(remainingSeconds / 60);
            remainingSeconds = remainingSeconds % 60;

            //  Ensure two-digits for small numbers
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

        //  Cleanse method inspired by the Chrome Last.fm Scrobbler extensionby David Sabata (https://github.com/david-sabata/Chrome-Last.fm-Scrobbler)
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

            if (n === 0) return m;
            if (m === 0) return n;

            //  Create an array of arrays in javascript (a descending loop is quicker)
            for (var firstStep1Index = n; firstStep1Index >= 0; firstStep1Index--) {
                d[firstStep1Index] = [];
            }

            //  Step 2
            for (var firstStep2Index = n; firstStep2Index >= 0; firstStep2Index--) d[firstStep2Index][0] = firstStep2Index;
            for (var secondStep2Index = m; secondStep2Index >= 0; secondStep2Index--) d[0][secondStep2Index] = secondStep2Index;

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
        },

        //  http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
        escapeRegExp: function (string) {
            var escapedString = string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            return escapedString;
        }
    });

    return new Utility();
});