define(function(require) {
  'use strict';

  var TimeLabelArea = require('foreground/model/streamControlBar/timeLabelArea');
  var TimeSlider = require('foreground/model/streamControlBar/timeSlider');
  var Tooltipable = require('foreground/view/behavior/tooltipable');
  var TimeSliderView = require('foreground/view/streamControlBar/timeSliderView');
  var TimeLabelAreaView = require('foreground/view/streamControlBar/timeLabelAreaView');
  var RadioButtonView = require('foreground/view/streamControlBar/radioButtonView');
  var RepeatButtonView = require('foreground/view/streamControlBar/repeatButtonView');
  var ShuffleButtonView = require('foreground/view/streamControlBar/shuffleButtonView');
  var NextButtonView = require('foreground/view/streamControlBar/nextButtonView');
  var PlayPauseButtonView = require('foreground/view/streamControlBar/playPauseButtonView');
  var PreviousButtonView = require('foreground/view/streamControlBar/previousButtonView');
  var StreamControlBarTemplate = require('text!template/streamControlBar/streamControlBar.html');
  var VideoActions = require('foreground/model/video/videoActions');

  var StreamControlBarView = Marionette.LayoutView.extend({
    id: 'streamControlBar',
    className: 'streamControlBar',
    template: _.template(StreamControlBarTemplate),

    regions: {
      timeLabelArea: 'timeLabelArea',
      timeSlider: 'timeSlider',
      radioButton: 'radioButton',
      repeatButton: 'repeatButton',
      shuffleButton: 'shuffleButton',
      previousButton: 'previousButton',
      playPauseButton: 'playPauseButton',
      nextButton: 'nextButton'
    },

    ui: {
      title: 'title'
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
      'change:loadedVideo': '_onPlayerChangeLoadedVideo'
    },

    initialize: function(options) {
      this.player = options.player;
      this.bindEntityEvents(this.player, this.playerEvents);
    },

    onRender: function() {
      var loadedVideo = this.player.get('loadedVideo');
      this._setTitle(loadedVideo);

      var timeSlider = new TimeSlider({
        currentTime: this.player.get('currentTime'),
        player: StreamusFG.backgroundProperties.player
      });

      this.showChildView('timeSlider', new TimeSliderView({
        model: timeSlider,
        streamItems: StreamusFG.backgroundProperties.stream.get('items'),
        player: StreamusFG.backgroundProperties.player
      }));

      var totalTime = _.isNull(loadedVideo) ? 0 : loadedVideo.get('duration');
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

    _onPlayerChangeLoadedVideo: function(model, loadedVideo) {
      this._setTitle(loadedVideo);
    },

    _onContextMenu: function(event) {
      event.preventDefault();
      // Show the element just slightly offset as to not break onHover effects.
      this._showContextMenu(event.pageY, event.pageX + 1);
    },

    _showContextMenu: function(top, left) {
      var loadedVideo = this.player.get('loadedVideo');

      if (!_.isNull(loadedVideo)) {
        var videoActions = new VideoActions();
        videoActions.showContextMenu(loadedVideo, top, left, this.player);
      }
    },

    _setTitle: function(loadedVideo) {
      var title = chrome.i18n.getMessage('streamEmpty');

      if (!_.isNull(loadedVideo)) {
        title = loadedVideo.get('title');
      }

      this.ui.title.text(title).attr('data-tooltip-text', title);
    }
  });

  return StreamControlBarView;
});