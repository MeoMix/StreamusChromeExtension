'use strict';
import {LayoutView} from 'marionette';
import TimeLabelArea from 'foreground/model/streamControlBar/timeLabelArea';
import TimeSlider from 'foreground/model/streamControlBar/timeSlider';
import Tooltipable from 'foreground/view/behavior/tooltipable';
import TimeSliderView from 'foreground/view/streamControlBar/timeSliderView';
import TimeLabelAreaView from 'foreground/view/streamControlBar/timeLabelAreaView';
import RadioButtonView from 'foreground/view/streamControlBar/radioButtonView';
import RepeatButtonView from 'foreground/view/streamControlBar/repeatButtonView';
import ShuffleButtonView from 'foreground/view/streamControlBar/shuffleButtonView';
import VolumeAreaView from 'foreground/view/streamControlBar/volumeAreaView';
import NextButtonView from 'foreground/view/streamControlBar/nextButtonView';
import PlayPauseButtonView from 'foreground/view/streamControlBar/playPauseButtonView';
import PreviousButtonView from 'foreground/view/streamControlBar/previousButtonView';
import StreamControlBarTemplate from 'template/streamControlBar/streamControlBar.html!text';
import VideoActions from 'foreground/model/video/videoActions';

var StreamControlBarView = LayoutView.extend({
  id: 'streamControlBar',
  className: 'streamControlBar',
  template: _.template(StreamControlBarTemplate),

  regions: {
    timeLabelArea: 'timeLabelArea',
    timeSlider: 'timeSlider',
    radioButton: 'radioButton',
    repeatButton: 'repeatButton',
    shuffleButton: 'shuffleButton',
    volumeArea: 'volumeArea',
    previousButton: 'previousButton',
    playPauseButton: 'playPauseButton',
    nextButton: 'nextButton'
  },

  ui: {
    title: 'title',
    content: 'content'
  },

  events: {
    'contextmenu @ui.content': '_onContextMenuContent'
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

    this.showChildView('volumeArea', new VolumeAreaView({
      player: StreamusFG.backgroundProperties.player
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

  _onContextMenuContent: function(event) {
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

export default StreamControlBarView;