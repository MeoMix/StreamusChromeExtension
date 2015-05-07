<h1 align="center">Streamus</h1>
<p align="center">The most popular Chrome extension YouTube music player.</p>
<p align="center">
  <a title='Build Status' href="https://travis-ci.org/MeoMix/StreamusChromeExtension">
    <img src='https://travis-ci.org/MeoMix/StreamusChromeExtension.svg?branch=Development' />
  </a>
</p>

<h2>Overview</h2>

This is the repository for Streamus the browser extension. The source for Streamus' [server](https://github.com/MeoMix/StreamusServer) and [website](https://github.com/MeoMix/StreamusWebsite) are located in their own, respective repositories.

Streamus is currently supported on all derivatives of WebKit such as [Chrome](http://www.google.com/chrome/), [Opera](http://www.opera.com/computer/windows), [Slimjet](http://www.slimjet.com/en/), and [Iron](https://www.srware.net/en/software_srware_iron.php). Additionally, it will support [Edge](http://windows.microsoft.com/en-us/windows/preview-microsoft-edge-pc) once stable.

It can be installed through the [Chrome Web Store](https://chrome.google.com/webstore/detail/streamus/jbnkffmindojffecdhbbmekbmkkfpmjd/), the [Opera Web Store](https://addons.opera.com/en/extensions/details/streamustm-beta/), or from the [Streamus website](https://streamus.com/)

<h2>Development</h2>

Start by cloning the development branch. All PRs should be submitted to the development branch.

<h3>Dependencies</h3>
You will need to have [Node](https://nodejs.org/) installed on your system as well as [Grunt](http://gruntjs.com/). After installing Node, navigate using a terminal to the directory in which you cloned Streamus. Then, perform the following command to install dependencies:

    npm install

<h3>Loading the extension</h3>
1. Navigate to **chrome://extensions/**
2. Ensure the checkbox labeled **Developer mode** is enabled.
3. Click the button labeled **Load unpacked extension...**
4. Select the directory **/StreamusChromeExtension/src/**

<img src='http://i.imgur.com/1fckCGn.png' />

<h3>Editing LESS</h3>
Streamus' CSS is compiled via [LESS](http://lesscss.org/). As such, you need to run the following command from the '/StreamusChromeExtension' directory before modifying any LESS files:

    grunt watch

After this command is running all modifications to .less files will automatically be compiled into .css.

<img src='http://i.imgur.com/bzEn7Ny.png' />

<h3>API keys</h3>
You will need to modify the example key files located in the [/js/background/key/](https://github.com/MeoMix/StreamusChromeExtension/tree/Development/src/js/background/key) directory. Production keys are not committed to GitHub. There is an example key provided. It should not be relied upon for anything other than testing.

<img src='http://i.imgur.com/Oyb7KqV.png' />

<h3>Server settings</h3>
Ensure that the property 'localDebug' is set to **false** unless you have configured an instance of Streamus' server on your local machine. The localDebug property can be found at [/js/background/application.js](https://github.com/MeoMix/StreamusChromeExtension/blob/Development/src/js/background/application.js).

<img src='http://i.imgur.com/S7iLhtI.png' />

<h3>Testing</h3>
Test cases may be ran by navigating to chrome-extension://jbnkffmindojffecdhbbmekbmkkfpmjd/test.html, but only after the extension package has been loaded into Google Chrome. 

<img src='http://i.imgur.com/OGBCmTz.png' />

<h2>Libraries</h2>

Streamus uses a fair number of third-party JavaScript libraries. Introduction of additional libraries for off-the-shelf functionality is discouraged. Non-core libraries may be removed in the near future and additional functionality should not be implemented with them.

<h3>Core</h3>
* [jQuery](http://jquery.com/)
* [Backbone](http://backbonejs.org/)
* [Marionette](http://marionettejs.com)
* [Lo-Dash](http://lodash.com/)
* [Require](http://requirejs.org/)
* [Text](https://github.com/requirejs/text)

<h3>Non-core</h3>
* [Backbone LocalStorage](https://github.com/jeromegn/Backbone.localStorage)
* [jQuery UI](http://jqueryui.com/)
* [jQuery Perfect Scrollbar](http://noraesae.github.io/perfect-scrollbar/)
* [jQuery qTip](http://qtip2.com/)

<h3>Testing</h3>
* [Mocha](http://visionmedia.github.io/mocha/)
* [Chai](http://chaijs.com/)
* [Sinon](http://sinonjs.org/)

<h2>Authors</h2>

* [MeoMix](https://github.com/MeoMix)

with translation support provided by a community of volunteers.

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
