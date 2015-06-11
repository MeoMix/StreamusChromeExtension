define(function(require) {
  'use strict';

  var TimeLabelArea = require('foreground/model/stream/timeLabelArea');
  var TimeSlider = require('foreground/model/stream/timeSlider');
  var Tooltipable = require('foreground/view/behavior/tooltipable');
  var TimeSliderView = require('foreground/view/stream/timeSliderView');
  var TimeLabelAreaView = require('foreground/view/stream/timeLabelAreaView');
  var RadioButtonView = require('foreground/view/stream/radioButtonView');
  var RepeatButtonView = require('foreground/view/stream/repeatButtonView');
  var ShuffleButtonView = require('foreground/view/stream/shuffleButtonView');
  var VideoButtonView = require('foreground/view/stream/videoButtonView');
  var NextButtonView = require('foreground/view/stream/nextButtonView');
  var PlayPauseButtonView = require('foreground/view/stream/playPauseButtonView');
  var PreviousButtonView = require('foreground/view/stream/previousButtonView');
  var StreamControlBarTemplate = require('text!template/stream/streamControlBar.html');
  var SongActions = require('foreground/model/song/songActions');

  var StreamControlBarView = Marionette.LayoutView.extend({
    id: 'streamControlBar',
    className: 'streamControlBar',
    template: _.template(StreamControlBarTemplate),

    regions: {
      timeLabelArea: '[data-region=timeLabelArea]',
      timeSlider: '[data-region=timeSlider]',
      radioButton: '[data-region=radioButton]',
      repeatButton: '[data-region=repeatButton]',
      shuffleButton: '[data-region=shuffleButton]',
      videoButton: '[data-region=videoButton]',
      previousButton: '[data-region=previousButton]',
      playPauseButton: '[data-region=playPauseButton]',
      nextButton: '[data-region=nextButton]'
    },

    ui: {
      title: '[data-ui~=title]'
    },

    events: {
      'contextmenu': '_onContextMenu'
    },

    modelEvents: {
      'change:activeStreamItem': '_onChangeActiveStreamItem'
    },

    behaviors: {
      Tooltipable: {
        behaviorClass: Tooltipable
      }
    },

    player: null,
    playerEvents: {
      'change:loadedSong': '_onPlayerChangeLoadedSong'
    },

    initialize: function(options) {
      this.player = options.player;
      this.bindEntityEvents(this.player, this.playerEvents);
    },

    onRender: function() {
      var loadedSong = this.player.get('loadedSong');
      this._setTitle(loadedSong);

      var timeSlider = new TimeSlider({
        currentTime: this.player.get('currentTime'),
        player: StreamusFG.backgroundProperties.player
      });

      this.showChildView('timeSlider', new TimeSliderView({
        model: timeSlider,
        streamItems: StreamusFG.backgroundProperties.stream.get('items'),
        player: StreamusFG.backgroundProperties.player
      }));

      var totalTime = _.isNull(loadedSong) ? 0 : loadedSong.get('duration');
      this.showChildView('timeLabelArea', new TimeLabelAreaView({
        model: new TimeLabelArea({
          totalTime: totalTime
        }),
        timeSlider: timeSlider,
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

    _onPlayerChangeLoadedSong: function(model, loadedSong) {
      this._setTitle(loadedSong);
    },

    _onContextMenu: function(event) {
      event.preventDefault();
      // Show the element just slightly offset as to not break onHover effects.
      this._showContextMenu(event.pageY, event.pageX + 1);
    },

    _showContextMenu: function(top, left) {
      var loadedSong = this.player.get('loadedSong');

      if (!_.isNull(loadedSong)) {
        var songActions = new SongActions();
        songActions.showContextMenu(loadedSong, top, left, this.player);
      }
    },

    _setTitle: function(loadedSong) {
      var title = chrome.i18n.getMessage('streamEmpty');

      if (!_.isNull(loadedSong)) {
        title = loadedSong.get('title');
      }

      this.ui.title.text(title).attr('data-tooltip-text', title);
    }
  });

  return StreamControlBarView;
});