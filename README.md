Streamus™
=========

A Google Chrome extension which allows users to add YouTube videos to playlists, share playlists and discover new YouTube videos.

Overview
========

Streamus consists of a front-end client, the Google Chrome extension, a back-end server and a website. This repository contains the files for the Google Chrome extension. Please see the other repositories, StreamusServer and StreamusWebsite, to gain a full understanding of the product.

Client
------

The Streamus extension utilizes many third-party libraries. Here's a list of those most prominent: 

* [jQuery (v2.0.3)](http://jquery.com/)
* [jQuery UI (v1.10.3)](http://jqueryui.com/)
* [jQuery Transit (v0.9.9)](http://ricostacruz.com/jquery.transit/)
* [jQuery qTip (v2.2.0)](http://qtip2.com/)
* [BackboneJS (v1.1.0)](http://backbonejs.org/)
* [RequireJS (v2.1.9)](http://requirejs.org/)
* [Lo-Dash (v2.2.1)](http://lodash.com/)
* [Jasmine (v1.3.1)](http://pivotal.github.io/jasmine/)
* [Selectize (v0.8.1)](http://brianreavis.github.io/selectize.js/)

Installation
========

1. Navigate to the page: chrome://extensions
2. Check the checkbox 'Developer mode.' This will introduce several new buttons to the chrome://extensions page
3. Click the button 'Load unpacked extension...'
4. Select the StreamusChromeExtension directory, click OK.
5. The extension should now be loaded and ready to be interacted upon.

* NOTE: StreamusChromeExtension is dependent on a server. If you wish to debug without a local server instance you will need to set the property 'localDebug' to false. To do so, navigate to: 'StreamusChromeExtension/js/background/model/settings.js"

Supported Functionality
========

* YouTube search
* Add YouTube video to playlist
* Add YouTube playlist as playlist
* Add YouTube channel as playlist
* Play, pause, skip, rewind, shuffle, repeat video, repeat playlist
* Radio / Discovery
* Desktop notifications of currently playing video
* Customizable keyboard shortcuts to control play, pause, skip, previous
* Sharing of playlists via URL
* Enhancement of YouTube video pages with injected Streamus HTML

Deployment
========

Streamus utilizes NodeJS and GruntJS to bundle and package itself for deployment to the Chrome Web Store. You'll need to have both of these pieces of software installed in order to build a distribution of Streamus.

Once installed, simply run "grunt dist:0.103" to generate a distribution zip versioned at v0.103. 

Uploading the .zip file to the Chrome Web Store will cause the new version to be distributed to all users within an hour.
 
Usage Demo
========

A video explanation of how to use Streamus can be found at:
* "Streamus - Stream Bar Preview" - http://youtu.be/wjMLQWGYGOc

License
=======
This work is licensed under the GNU General Public License v2 (GPL-2.0)

Authors
=======

* MeoMix - Original developer, main contributor.
* MiracleBlue - Superstar co-developer extraordinare!
* Misostc - Phenomenal user interfactor designer.
