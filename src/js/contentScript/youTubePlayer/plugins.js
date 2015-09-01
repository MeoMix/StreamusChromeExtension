'use strict';
import 'marionette';
import Application from 'contentScript/youTubePlayer/application';

// Finally, load the application which will initialize the youTubePlayer:
window.Application = new Application();
window.Application.start();