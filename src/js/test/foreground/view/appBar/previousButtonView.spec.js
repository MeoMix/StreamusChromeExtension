define(function(require) {
  'use strict';

  var PreviousButtonView = require('foreground/view/appBar/previousButtonView');
  var PreviousButton = require('background/model/previousButton');
  var Stream = require('background/model/stream');
  var Player = require('background/model/player');
  var Settings = require('background/model/settings');
  var YouTubePlayer = require('background/model/youTubePlayer');
  var RadioButton = require('background/model/radioButton');
  var ShuffleButton = require('background/model/shuffleButton');
  var RepeatButton = require('background/model/repeatButton');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('PreviousButtonView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();

      var player = new Player({
        settings: new Settings(),
        youTubePlayer: new YouTubePlayer()
      });

      var shuffleButton = new ShuffleButton();
      var radioButton = new RadioButton();
      var repeatButton = new RepeatButton();

      this.view = new PreviousButtonView({
        model: new PreviousButton({
          player: player,
          shuffleButton: shuffleButton,
          repeatButton: repeatButton,
          stream: new Stream({
            player: player,
            shuffleButton: shuffleButton,
            radioButton: radioButton,
            repeatButton: repeatButton
          })
        })
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});