import {Model} from 'backbone';

var VideoStream = Model.extend({
  defaults: {
    currentTime: 0,
    muted: false,
    volume: 50,
    suggestedQuality: 'default',
    isSeeking: false
  }
});

export default VideoStream;