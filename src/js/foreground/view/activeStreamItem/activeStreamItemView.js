define(function(require){
	'use strict';
	
	var TimeArea = require('foreground/model/timeArea');
	var Tooltipable = require('foreground/view/behavior/tooltipable');
	var TimeAreaView = require('foreground/view/activeStreamItem/timeAreaView');
	var NextButtonView = require('foreground/view/activeStreamItem/nextButtonView');
	var PlayPauseButtonView = require('foreground/view/activeStreamItem/playPauseButtonView');
	var PreviousButtonView = require('foreground/view/activeStreamItem/previousButtonView');
	var ActiveStreamItemTemplate = require('text!template/activeStreamItem/activeStreamItem.html');
	var ContextMenuAction = require('foreground/model/contextMenuAction');
	
	var ActiveStreamItemView = Marionette.LayoutView.extend({
		id: 'activeStreamItem',
		template: _.template(ActiveStreamItemTemplate),
		
		regions: function() {
			return {
				timeAreaRegion: '#' + this.id + '-timeAreaRegion',
				nextButtonRegion: '#' + this.id + '-nextButtonRegion',
				playPauseButtonRegion: '#' + this.id + '-playPauseButtonRegion',
				previousButtonRegion: '#' + this.id + '-previousButtonRegion'
			};
		},
		
		events: {
			'contextmenu': '_onContextMenu'
		},
		
		behaviors: {
			Tooltipable: {
				behaviorClass: Tooltipable
			}
		},
		
		instant: false,
		player: null,
		
		initialize: function(options) {
			this.instant = options.instant;
			this.player = options.player;
		},
		
		onRender: function() {
			if (this.instant) {
				this.$el.addClass('is-instant');
			} else {
				this.$el.on('webkitTransitionEnd', this._onTransitionInComplete.bind(this));
			}
			
			this.showChildView('timeAreaRegion', new TimeAreaView({
				streamItems: Streamus.backgroundPage.stream.get('items'),
				player: Streamus.backgroundPage.player,
				model: new TimeArea({
					totalTime: this.model.get('song').get('duration')
				})
			}));
			
			this.showChildView('previousButtonRegion', new PreviousButtonView({
				model: Streamus.backgroundPage.previousButton
			}));
			
			this.showChildView('nextButtonRegion', new NextButtonView({
				model: Streamus.backgroundPage.nextButton
			}));
			
			this.showChildView('playPauseButtonRegion', new PlayPauseButtonView({
				model: Streamus.backgroundPage.playPauseButton,
				player: Streamus.backgroundPage.player
			}));	
		},
		
		onAttach: function() {
			if (this.instant) {
				this.$el.addClass('is-visible');
				Streamus.channels.activeStreamItemArea.vent.trigger('visible');
			} else {
				requestAnimationFrame(function() {
					this.$el.addClass('is-visible');
				}.bind(this));
				
				Streamus.channels.activeStreamItemArea.vent.trigger('beforeVisible');
			}
		},
		
		hide: function() {
			this.$el.on('webkitTransitionEnd', this._onTransitionOutComplete.bind(this));
			this.$el.removeClass('is-instant is-visible');
		},
		
		showContextMenu: function() {
			var contextMenuAction = new ContextMenuAction({
				song: this.model.get('song'),
				player: this.player
			});
			contextMenuAction.showContextMenu();
		},
		
		_onTransitionInComplete: function(event) {
			if (event.target === event.currentTarget) {
				this.$el.off('webkitTransitionEnd');
				Streamus.channels.activeStreamItemArea.vent.trigger('visible');
			}
		},
		
		_onTransitionOutComplete: function(event) {
			if (event.target === event.currentTarget) {
				this.$el.off('wekbitTransitionEnd');
				Streamus.channels.activeStreamItemArea.vent.trigger('hidden');
				this.destroy();
			}
		},
		
		_onContextMenu: function() {
			event.preventDefault();
			this.showContextMenu();
		}
	});
	
	return ActiveStreamItemView;
});