//  Provides an interface to the YouTube iFrame.
//  Starts up Player object after receiving a ready response from the YouTube API.
define(function () {
	'use strict';

	var YouTubePlayerAPI = Backbone.Model.extend({
		defaults: {
			ready: false,
			inserted: false
		},

		load: function () {
			//  TODO: If I insert the script, but _onYouTubeIframeAPIReady fails to load for whatever reason, I need to be able to recover gracefully somehow.
			if (this.get('inserted')) {
				Backbone.Wreqr.radio.channel('error').commands.trigger('log:message', 'API script already inserted');
				return;
			}

			//  This function will be called when the API is fully loaded. Needs to be exposed globally so YouTube can call it.
			window.onYouTubeIframeAPIReady = this._onYouTubeIframeAPIReady.bind(this);

			$('<script>', {
				src: 'https://www.youtube.com/iframe_api',
			}).insertBefore($('script:first'));

			this.set('inserted', true);
		},
		
		_onYouTubeIframeAPIReady: function () {
			this.set('ready', true);
		}
	});

	return YouTubePlayerAPI;
});