define([
    'backgroundDependentForegroundView',
    'youTubePlayerError'
], function (BackgroundDependentForegroundView, YouTubePlayerError) {
    'use strict';

    describe('BackgroundDependentForegroundView', function () {

        it('Should already be initialized', function () {
            expect(_.isFunction(BackgroundDependentForegroundView)).toEqual(false);
        });

        it('Should be able to show a YouTube error', function () {
            var thrownException = null;

            try {
                BackgroundDependentForegroundView.showYouTubeError(YouTubePlayerError.InvalidParameter);
            } catch(exception) {
                thrownException = exception;
            }

            expect(thrownException).toEqual(null);

            //BackgroundDependentForegroundView.showYouTubeError(YouTubePlayerError.None);
            //BackgroundDependentForegroundView.showYouTubeError(YouTubePlayerError.InvalidParameter);
            //BackgroundDependentForegroundView.showYouTubeError(YouTubePlayerError.VideoNotFound);
            //BackgroundDependentForegroundView.showYouTubeError(YouTubePlayerError.NoPlayEmbedded);
            //BackgroundDependentForegroundView.showYouTubeError(YouTubePlayerError.NoPlayEmbedded2);
        });

    });

});

