define(function() { 
  'use strict';

  var Port = Backbone.Model.extend({
    _port: null,

    defaults: {
      isConnected: false
    },

    initialize: function() {
      this._onPortMessage = this._onPortMessage.bind(this);
    },

    connect: function() {
      if (!this.get('isConnected')) {
        this._port = chrome.runtime.connect({
          name: 'youTubePlayer'
        });

        this._port.onMessage.addListener(this._onPortMessage);
        this.set('isConnected', true);
      }
    },

    postMessage: function(message) {
      if (this.get('isConnected')) {
        this._port.postMessage(message);
      } else {
        console.error('Attempted to use port while in a disconnected state.');
      }
    },

    _onPortMessage: function(message) {
      // Trigger the event so that outsiders can subscribe to it without need to be aware of chromePort.
      this.trigger('receive:message', message);
    }
  });

  return Port;
});