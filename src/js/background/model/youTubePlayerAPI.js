//  Provides an interface to the YouTube iFrame.
//  Starts up Player object after receiving a ready response from the YouTube API.
define(function () {
	'use strict';

	var YouTubePlayerAPI = Backbone.Model.extend({
		defaults: {
			ready: false
		},

		load: function () {
			if (this.get('ready')) {
				console.warn('YouTube Player API is already loaded and should not be loaded again');
				return;
			}

			//  This function will be called when the API is fully loaded. Needs to be exposed globally so YouTube can call it.
			window.onYouTubeIframeAPIReady = this._onYouTubeIframeAPIReady.bind(this);

			$('<script>', {
				src: 'https://www.youtube.com/iframe_api',
			}).insertBefore($('script:first'));
		},
		
		_onYouTubeIframeAPIReady: function () {
			this.set('ready', true);
		}
	});

	return YouTubePlayerAPI;
});