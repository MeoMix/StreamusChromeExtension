//  Load Google's JavaScript Client API using requireJS !async plugin.
//  You can learn more about the async plugin here: https://github.com/millermedeiros/requirejs-plugins/blob/master/src/async.js
define([
    'async!https://apis.google.com/js/client.js!onload'
], function () {
    'use strict';
    return window.gapi;
});