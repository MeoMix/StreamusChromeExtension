define(function(require) {
  'use strict';

  var NextButtonView = require('foreground/view/stream/nextButtonView');
  var NextButton = require('background/model/nextButton');
  var Stream = require('background/model/stream');
  var Player = require('background/model/player');
  var Settings = require('background/model/settings');
  var YouTubePlayer = require('background/model/youTubePlayer');
  var RadioButton = require('background/model/radioButton');
  var ShuffleButton = require('background/model/shuffleButton');
  var RepeatButton = require('background/model/repeatButton');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('NextButtonView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();

      var shuffleButton = new ShuffleButton();
      var radioButton = new RadioButton();
      var repeatButton = new RepeatButton();

      this.view = new NextButtonView({
        model: new NextButton({
          stream: new Stream({
            player: new Player({
              settings: new Settings(),
              youTubePlayer: new YouTubePlayer()
            }),
            shuffleButton: shuffleButton,
            radioButton: radioButton,
            repeatButton: repeatButton
          }),
          radioButton: radioButton,
          shuffleButton: shuffleButton,
          repeatButton: repeatButton
        })
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});