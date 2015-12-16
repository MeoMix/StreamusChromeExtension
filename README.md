<h1 align="center">Streamus</h1>
<p align="center">The most popular Chrome extension YouTube video player.</p>
<p align="center">
  <a title='Build Status' href="https://travis-ci.org/MeoMix/StreamusChromeExtension">
    <img src='https://travis-ci.org/MeoMix/StreamusChromeExtension.svg?branch=Development' />
  </a>
  <a title='Join the chat at https://gitter.im/MeoMix/StreamusChromeExtension' href="https://gitter.im/MeoMix/StreamusChromeExtension?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge">
    <img src='https://badges.gitter.im/Join%20Chat.svg?branch=Development' />
  </a>
</p>

<h2>Overview</h2>

This is the repository for Streamus the browser extension. The source for Streamus' [server](https://github.com/MeoMix/StreamusServer) and [website](https://github.com/MeoMix/StreamusWebsite) are located in their own, respective repositories.

Streamus is currently supported on all derivatives of WebKit such as [Chrome](http://www.google.com/chrome/), [Opera](http://www.opera.com/computer/windows), [Slimjet](http://www.slimjet.com/en/), and [Iron](https://www.srware.net/en/software_srware_iron.php). Additionally, it will support [Edge](http://windows.microsoft.com/en-us/windows/preview-microsoft-edge-pc) once stable.

It can be installed through the [Chrome Web Store](https://chrome.google.com/webstore/detail/streamus/jbnkffmindojffecdhbbmekbmkkfpmjd/), the [Opera Web Store](https://addons.opera.com/en/extensions/details/streamustm-beta/), or from the [Streamus website](https://streamus.com/)

<h2>Development</h2>

Start by cloning the development branch. All PRs should be submitted to the development branch.

* For more information regarding development of Chrome extensions, see [Getting Started: Building a Chrome Extension](https://developer.chrome.com/extensions/getstarted)
* For more information regarding Chrome extension APIs, see [Chrome Platform APIs](https://developer.chrome.com/extensions/api_index)

<h3>Dependencies</h3>
You will need to have [Node](https://nodejs.org/), [Grunt](http://gruntjs.com/), and [jspm](http://jspm.io/) installed on your system. After installing Node, navigate using a terminal to the directory in which you cloned Streamus. Then, perform the following command to install dependencies:

npm install
jspm install

<h3>Compiling code</h3>
Streamus' CSS is compiled via [LESS](http://lesscss.org/) and much of it's JavaScript is transpiled via [Babel](https://babeljs.io/). Run the following command from your terminal to build a usable version of Streamus:

grunt compile

This command will parse all currently existing .less files and transform them into .css. Then, it will compile all ES6 JavaScript files into their equivalent ES5 syntax. Then, it will begin to watch for modifications to those files and automatically re-compiled as needed.
All compiled files go into the /compiled directory.

<img src='http://i.imgur.com/8POyKL2.png' />

<h3>API keys</h3>
You will need to modify the example key files located in the [/js/background/key/](https://github.com/MeoMix/StreamusChromeExtension/tree/Development/src/js/background/key) directory. Copy `youTubeAPIKey.js.example`, rename it to `youTubeAPIKey.js` and replace the example API key with your own. Production keys are not committed to GitHub. The example key provided should not be relied upon for anything other than testing and it may be revoked without warning. You are strongly encouraged to generate your own key.

<img src='http://i.imgur.com/qyL2RhS.png' />

<h3>Server settings</h3>
Ensure that the property 'localDebug' is set to **false** unless you have configured an instance of Streamus' server on your local machine. The localDebug property can be found at [/js/background/application.js](https://github.com/MeoMix/StreamusChromeExtension/blob/Development/src/js/background/application.js).

<img src='http://i.imgur.com/S7iLhtI.png' />

<h3>Loading the extension</h3>
1. Navigate to **chrome://extensions/**
2. Ensure the checkbox labeled **Developer mode** is enabled.
3. Click the button labeled **Load unpacked extension...**
4. Select the directory **/StreamusChromeExtension/compiled** (Note: this directory won't exist by default. See Compiling code for more details)

<h3>Testing</h3>
Test cases may be ran by navigating to chrome-extension://jbnkffmindojffecdhbbmekbmkkfpmjd/test.html, but only after the extension package has been loaded into Google Chrome.
Alternatively, tests may be ran through grunt via `grunt test`

<img src='http://i.imgur.com/OGBCmTz.png' />

<h2>Libraries</h2>

Streamus uses a fair number of third-party JavaScript libraries. Introduction of additional libraries for off-the-shelf functionality is discouraged. Non-core libraries may be removed in the near future and additional functionality should not be implemented with them.

<h3>Core</h3>
* [jQuery](http://jquery.com/)
* [Backbone](http://backbonejs.org/)
* [Marionette](http://marionettejs.com)
* [lodash](http://lodash.com/)
* [jspm](http://jspm.io//)
* [SystemJS](https://github.com/systemjs/systemjs)
* [Babel](https://babeljs.io/)
* [Grunt](http://gruntjs.com/)
* [Handlebars](http://handlebarsjs.com/)

<h3>Non-core</h3>
* [Backbone LocalStorage](https://github.com/jeromegn/Backbone.localStorage)
* [Backbone Cocktail](https://github.com/onsi/cocktail)
* [jQuery UI](http://jqueryui.com/)

<h3>Testing</h3>
* [Mocha](http://visionmedia.github.io/mocha/)
* [Chai](http://chaijs.com/)
* [Sinon](http://sinonjs.org/)

<h2>Authors</h2>

* [MeoMix](https://github.com/MeoMix)

with translation support provided by a community of volunteers.
