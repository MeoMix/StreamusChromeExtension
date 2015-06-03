define({
  // Inspired by: https://gist.github.com/danro/7846358
  // Pass requestAnimationFrame as the throttleMechanism. Necessary because RAF is scoped to the current window.
  // Leverage requestAnimationFrame for throttling function calls instead of setTimeout for better perf.
  throttleFramerate: function(throttleMechanisim, callback) {
    var wait = false;
    var args = null;
    var context = null;

    return function() {
      if (!wait) {
        wait = true;
        args = arguments;
        context = this;
        throttleMechanisim(function() {
          wait = false;
          callback.apply(context, args);
        });
      }
    };
  }
});