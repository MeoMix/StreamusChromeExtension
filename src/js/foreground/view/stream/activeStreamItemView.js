define(function(require) {
  'use strict';

  var TimeArea = require('foreground/model/stream/timeArea');
  var Tooltipable = require('foreground/view/behavior/tooltipable');
  var TimeAreaView = require('foreground/view/stream/timeAreaView');
  var RadioButtonView = require('foreground/view/stream/radioButtonView');
  var RepeatButtonView = require('foreground/view/stream/repeatButtonView');
  var ShuffleButtonView = require('foreground/view/stream/shuffleButtonView');
  var VideoButtonView = require('foreground/view/stream/videoButtonView');
  var NextButtonView = require('foreground/view/stream/nextButtonView');
  var PlayPauseButtonView = require('foreground/view/stream/playPauseButtonView');
  var PreviousButtonView = require('foreground/view/stream/previousButtonView');
  var ActiveStreamItemTemplate = require('text!template/stream/activeStreamItem.html');
  var SongActions = require('foreground/model/song/songActions');

  var ActiveStreamItemView = Marionette.LayoutView.extend({
    id: 'activeStreamItem',
    className: 'activeStreamItem u-shadowed--low',
    template: _.template(ActiveStreamItemTemplate),

    regions: {
      timeArea: '[data-region=timeArea]',
      radioButton: '[data-region=radioButton]',
      repeatButton: '[data-region=repeatButton]',
      shuffleButton: '[data-region=shuffleButton]',
      videoButton: '[data-region=videoButton]',
      previousButton: '[data-region=previousButton]',
      playPauseButton: '[data-region=playPauseButton]',
      nextButton: '[data-region=nextButton]'
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

      this.showChildView('timeArea', new TimeAreaView({
        model: new TimeArea({
          totalTime: this.model.get('song').get('duration')
        }),
        streamItems: StreamusFG.backgroundProperties.stream.get('items'),
        player: StreamusFG.backgroundProperties.player
      }));

      this.showChildView('shuffleButton', new ShuffleButtonView({
        model: StreamusFG.backgroundProperties.shuffleButton
      }));

      this.showChildView('repeatButton', new RepeatButtonView({
        model: StreamusFG.backgroundProperties.repeatButton
      }));

      this.showChildView('radioButton', new RadioButtonView({
        model: StreamusFG.backgroundProperties.radioButton
      }));

      this.showChildView('videoButton', new VideoButtonView({
        model: StreamusFG.backgroundProperties.videoButton
      }));

      this.showChildView('previousButton', new PreviousButtonView({
        model: StreamusFG.backgroundProperties.previousButton
      }));

      this.showChildView('playPauseButton', new PlayPauseButtonView({
        model: StreamusFG.backgroundProperties.playPauseButton,
        player: StreamusFG.backgroundProperties.player
      }));

      this.showChildView('nextButton', new NextButtonView({
        model: StreamusFG.backgroundProperties.nextButton
      }));
    },

    onAttach: function() {
      // If the view is shown instantly then there is no transition to wait for, so announce shown immediately.
      if (this.instant) {
        this.$el.addClass('is-visible');
        StreamusFG.channels.activeStreamItemArea.vent.trigger('visible');
      } else {
        requestAnimationFrame(function() {
          this.$el.addClass('is-visible');
        }.bind(this));
      }
    },

    hide: function() {
      this.$el.on('webkitTransitionEnd', this._onTransitionOutComplete.bind(this));
      this.$el.removeClass('is-instant is-visible');
    },

    showContextMenu: function(top, left) {
      var songActions = new SongActions();
      var song = this.model.get('song');

      songActions.showContextMenu(song, top, left, this.player);
    },

    _onTransitionInComplete: function(event) {
      if (event.target === event.currentTarget) {
        this.$el.off('webkitTransitionEnd');
        StreamusFG.channels.activeStreamItemArea.vent.trigger('visible');
      }
    },

    _onTransitionOutComplete: function(event) {
      if (event.target === event.currentTarget) {
        this.$el.off('webkitTransitionEnd');
        StreamusFG.channels.activeStreamItemArea.vent.trigger('hidden');
        this.destroy();
      }
    },

    _onContextMenu: function(event) {
      event.preventDefault();
      // Show the element just slightly offset as to not break onHover effects.
      this.showContextMenu(event.pageY, event.pageX + 1);
    }
  });

  return ActiveStreamItemView;
});