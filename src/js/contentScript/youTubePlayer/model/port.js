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

    // Utilize Chrome's API to establish a connection from the YouTube page back to Streamus.
    connect: function() {
      if (!this.get('isConnected')) {
        this._port = chrome.runtime.connect({
          name: 'youTubePlayer'
        });

        this._port.onMessage.addListener(this._onPortMessage);
        this.set('isConnected', true);
      }
    },

    // Break an existing connection by disconnecting the port.
    disconnect: function() {
      if (this.get('isConnected')) {
        this._port.onMessage.removeListener(this._onPortMessage);
        this._port.disconnect();
        this._port = null;
        this.set('isConnected', false);
      }
    },

    // Send a message through the provided Chrome port back to the Streamus extension.
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