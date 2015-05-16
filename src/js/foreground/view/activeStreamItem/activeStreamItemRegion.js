define(function(require) {
	'use strict';
	
	var ActiveStreamItemView = require('foreground/view/activeStreamItem/activeStreamItemView');
	
	var ActiveStreamItemRegion = Marionette.Region.extend({
		initialize: function() {
			this.listenTo(Streamus.channels.foregroundArea.vent, 'rendered', this._onForegroundAreaRendered);
			this.listenTo(Streamus.backgroundPage.stream.get('items'), 'change:active', this._onChangeActive);
		},
		
		_onForegroundAreaRendered: function() {
			this.show(new ActiveStreamItemView({
				model: Streamus.backgroundPage.stream.get('activeItem'),
				player: Streamus.backgroundPage.player,
				instant: Streamus.backgroundPage.stream.previous('activeItem') !== null
			}));
		},
		
		_onChangeActive: function(model, active) {
			if (active) {
				this.show(new ActiveStreamItemView({
					model: model,
					player: Streamus.backgroundPage.player,
					instant: Streamus.backgroundPage.stream.previous('activeItem') !== null
				}));	
			}
		}
	});
	
	return ActiveStreamItemRegion;
});