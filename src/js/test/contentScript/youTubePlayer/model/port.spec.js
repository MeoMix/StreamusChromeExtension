'use strict';
import Port from 'contentScript/youTubePlayer/model/port';

describe('Port', function() {
  beforeEach(function() {
    this.port = new Port();
  });

  describe('connect', function() {
    afterEach(function() {
      this.port.disconnect();
    });

    it('should connect successfully', function() {
      this.port.connect();
      expect(this.port.get('isConnected')).to.equal(true);
    });
  });

  describe('disconnect', function() {
    it('should disconnect successfully', function() {
      this.port.connect();
      this.port.disconnect();
      expect(this.port.get('isConnected')).to.equal(false);
    });
  });

  describe('postMessage', function() {
    it('should successfully send a message if connected', function() {
      this.port.connect();

      sinon.spy(this.port._port, 'postMessage');
      this.port.postMessage('message');
      expect(this.port._port.postMessage.calledOnce).to.equal(true);
      this.port._port.postMessage.restore();
    });
  });
});