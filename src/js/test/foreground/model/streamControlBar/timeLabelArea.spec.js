import TimeLabelArea from 'foreground/model/streamControlBar/timeLabelArea';

describe('TimeLabelArea', function() {
  beforeEach(function() {
    this.timeLabelArea = new TimeLabelArea();
  });

  it('should be able to toggle its showRemainingTime property', function() {
    var currentShowRemainingTime = this.timeLabelArea.get('showRemainingTime');
    this.timeLabelArea.toggleShowRemainingTime();
    var updatedShowRemainingTime = this.timeLabelArea.get('showRemainingTime');
    expect(updatedShowRemainingTime).not.to.equal(currentShowRemainingTime);
    expect(updatedShowRemainingTime).to.equal(!currentShowRemainingTime);
  });
});