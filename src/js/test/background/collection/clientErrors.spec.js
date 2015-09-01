'use strict';
import ClientErrors from 'background/collection/clientErrors';
import ClientError from 'background/model/clientError';

describe('ClientErrors', function() {
  beforeEach(function() {
    this.clientErrors = new ClientErrors();
  });

  describe('when adding models', function() {
    it('should be able to add a model successfully', function() {
      this.clientErrors.add({});
      expect(this.clientErrors.length).to.equal(1);
    });

    it('should not add duplicate objects by their lineNumber & stackTrace', function() {
      this.clientErrors.add({
        lineNumber: 1,
        stack: ''
      });

      this.clientErrors.add({
        lineNumber: 1,
        stack: ''
      });

      expect(this.clientErrors.length).to.equal(1);
    });

    it('should not add duplicate models by their lineNumber & stackTrace', function() {
      this.clientErrors.add(new ClientError({
        lineNumber: 1,
        stack: ''
      }));

      this.clientErrors.add(new ClientError({
        lineNumber: 1,
        stack: ''
      }));

      expect(this.clientErrors.length).to.equal(1);
    });
  });

  describe('when checking for duplicates', function() {
    it('should know if a given model is a duplicate', function() {
      this.clientErrors.add({
        lineNumber: 1,
        stack: ''
      });

      var hasDuplicate = this.clientErrors._hasDuplicate(1, '');
      expect(hasDuplicate).to.equal(true);
    });

    it('should not consider matching lineNumber but non-matching stack a duplicate', function() {
      this.clientErrors.add({
        lineNumber: 1,
        stack: ''
      });

      var hasDuplicate = this.clientErrors._hasDuplicate(1, 'asd');
      expect(hasDuplicate).to.equal(false);
    });

    it('should not consider matching stack but non-matching lineNumber a duplicate', function() {
      this.clientErrors.add({
        lineNumber: 1,
        stack: ''
      });

      var hasDuplicate = this.clientErrors._hasDuplicate(2, '');
      expect(hasDuplicate).to.equal(false);
    });
  });
});