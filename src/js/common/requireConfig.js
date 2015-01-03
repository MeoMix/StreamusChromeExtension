define(function () {
	'use strict';

	require.config({
		baseUrl: 'js/',
		enforceDefine: true,

		paths: {
			//  Paths:
			'template': '../template',

			//  Third Party:
			'backbone': 'thirdParty/backbone',
			'backbone.localStorage': 'thirdParty/backbone.localStorage',
			'backbone.marionette': 'thirdParty/backbone.marionette',
			'cocktail': 'thirdParty/cocktail',
			'googleAnalytics': 'thirdParty/googleAnalytics',
			'jquery': 'thirdParty/jquery',
			'jquery.perfectScrollbar': 'thirdParty/jquery.perfectScrollbar',
			'jquery.qtip': 'thirdParty/jquery.qtip',
			'jquery-ui': 'thirdParty/jquery-ui',
			'less': 'thirdParty/less',
			//  Rename lodash to underscore since functionally equivilant but underscore is expected by other third party libraries.
			'underscore': 'thirdParty/lodash',
			'selectize': 'thirdParty/selectize',
			'text': 'thirdParty/text'
		},

		shim: {
			'googleAnalytics': {
				exports: 'ga'
			},
			'less': {
				exports: 'window.less'
			}
		}
	});
});