[![Build Status](https://travis-ci.org/MeoMix/StreamusChromeExtension.svg?branch=Development)](https://travis-ci.org/MeoMix/StreamusChromeExtension)

Streamus™
=========

A Google Chrome extension which allows users to search & add songs to playlists, share playlists with others, and discover new songs.

Overview
========

Streamus consists of a front-end client, the Google Chrome extension, a back-end server and a website. This repository contains the files for the Google Chrome extension. Please see the other repositories, [StreamusServer](https://github.com/MeoMix/StreamusServer) and [StreamusWebsite](https://github.com/MeoMix/StreamusWebsite), to gain a full understanding of the product.
Streamus currently only supports YouTube's API, but will be expanding to SoundCloud shortly.

Development
========

1. Navigate to: chrome://extensions/
2. Enabled developer mode by checking the 'Developer mode' checkbox. This will introduce several new buttons to the chrome://extensions page
3. Click the button 'Load unpacked extension...'
4. Select the directory '/Streamus Chrome Extension/src/'
5. Streamus is now loaded and can be developed upon.

**API KEYS:**
You will need to modify the example key files located in the 'js/background/key/' directory. Production keys are not committed to GitHub.

**SERVER SETTINGS:**
Ensure that the property 'localDebug' is set to **false** unless you have configured an instance of Streamus' server on your local machine. The localDebug property can be found at 'src/js/background/application.js'.

Testing
------
Test cases may be ran by navigating to chrome-extension://jbnkffmindojffecdhbbmekbmkkfpmjd/test.html, but only after the extension package has been loaded into Google Chrome. 

Streamus uses [Mocha](http://visionmedia.github.io/mocha/), [Chai](http://chaijs.com/), and [Sinon](http://sinonjs.org/) for its test cases.

Deployment
========

Streamus utilizes NodeJS and GruntJS to bundle and package itself for deployment to the Chrome Web Store.
Run "grunt deploy" to generate a new dist folder. Provide a version number, i.e. "grunt deploy:0.103" to generate a .zip file and adjust the build version. 
Uploading the .zip file to the Chrome Web Store will cause the new version to be distributed to all users within an hour.
 
Supported Functionality
========

* YouTube search
* Add YouTube video to playlist
* Add YouTube playlist as playlist
* Add YouTube channel as playlist
* Play, pause, skip, rewind, shuffle, repeat video, repeat playlist
* Discovery of songs via radio
* Desktop notifications of currently playing video
* Customizable keyboard shortcuts
* Sharing of playlists via URL
* Enhancement of YouTube video pages with injected HTML
* Enhancement of Beatport Top 10/100 pages with injected HTML

Usage Demo
========

A video explanation of how to use Streamus can be found [here on YouTube](https://www.youtube.com/watch?v=sVxncDakIdA)

Third-Party Libraries
------

Streamus utilizes several third-party libraries. Here's a list of those most prominent: 

* [BackboneJS](http://backbonejs.org/)
* [Backbone LocalStorage](https://github.com/jeromegn/Backbone.localStorage)
* [Backbone MarionetteJS](http://marionettejs.com)
* [Chai](http://chaijs.com/)
* [jQuery](http://jquery.com/)
* [jQuery UI](http://jqueryui.com/)
* [jQuery Perfect Scrollbar](http://noraesae.github.io/perfect-scrollbar/)
* [jQuery qTip](http://qtip2.com/)
* [Less](http://lesscss.org)
* [Lo-Dash](http://lodash.com/)
* [Mocha](http://visionmedia.github.io/mocha/)
* [RequireJS](http://requirejs.org/)
* [Sinon](http://sinonjs.org/)
* [Text](https://github.com/requirejs/text)

License
=======

Licensed under the Apache License, Version 2.0 (the "License");
you may not use any files in this repository except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
