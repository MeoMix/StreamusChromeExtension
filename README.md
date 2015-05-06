<h1 align="center">Streamus</h1>
<p align="center">The most popular Chrome extension YouTube music player</p>
<p align="center">
  <a title='Build Status' href="https://travis-ci.org/MeoMix/StreamusChromeExtension">
    <img src='https://travis-ci.org/MeoMix/StreamusChromeExtension.svg?branch=Development' />
  </a>
</p>

<h2>Overview</h2>

This is the repository for Streamus the browser extension. The server and website are located elsewhere:

* [Server](https://github.com/MeoMix/StreamusServer)
* [Website](https://github.com/MeoMix/StreamusWebsite)

Streamus is currently supported on all derivatives of WebKit such as Chrome, Opera, Slimjet, and Iron. Additionally, it will support Edge once Edge becomes stable.

<h2>Development</h2>

<h3>Loading the extension</h3>
1. Navigate to: chrome://extensions/
2. Toggle the 'Developer mode' checkbox on.
3. Click the button 'Load unpacked extension...'
4. Select the directory '/Streamus Chrome Extension/src/'
5. Streamus is now loaded and can be developed upon.

<h3>API keys</h3>
You will need to modify the example key files located in the [/js/background/key/](https://github.com/MeoMix/StreamusChromeExtension/tree/Development/src/js/background/key) directory. Production keys are not committed to GitHub. There is an example key provided. It should not be relied upon for anything other than testing.

<h3>Server settings</h3>
Ensure that the property 'localDebug' is set to **false** unless you have configured an instance of Streamus' server on your local machine. The localDebug property can be found at [/js/background/application.js](https://github.com/MeoMix/StreamusChromeExtension/blob/Development/src/js/background/application.js).

Testing
------
Test cases may be ran by navigating to chrome-extension://jbnkffmindojffecdhbbmekbmkkfpmjd/test.html, but only after the extension package has been loaded into Google Chrome. 

Streamus uses [Mocha](http://mochajs.org/), [Chai](http://chaijs.com/), and [Sinon](http://sinonjs.org/) for its test cases.

Libraries
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

<h2>License</h2>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use any files in this repository except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
