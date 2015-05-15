define(function(require) {
	'use strict';
	
	var PreviousButtonTemplate = require('text!template/activeStreamItem/previousButton.html');
	var PreviousIconTemplate = require('text!template/icon/previousIcon_24.svg');
	
	var PreviousButtonView = Marionette.ItemView.extend({
		id: 'previousButton',
		className: 'button button--icon button--icon--secondary button--large',
		template: _.template(PreviousButtonTemplate),
		templateHelpers: {
			previousIcon: _.template(PreviousIconTemplate)()
		},
		
		events: {
			'click': '_onClick'
		},
		
		modelEvents: {
			'change:enabled': '_onChangeEnabled'
		},
		
		onRender: function() {
			this._setState(this.model.get('enabled'));
		},
		
		_onClick: function() {
			this.model.tryDoTimeBasedPrevious();
		},
		
		_onChangeEnabled: function(model, enabled) {
			this._setState(enabled);
		},
		
		_setState: function(enabled) {
			this.$el.toggleClass('is-disabled', !enabled);
		}
	});
	
	return PreviousButtonView;
});