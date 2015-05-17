define({
    //  Inspired by: https://gist.github.com/danro/7846358
    //  Pass requestAnimationFrame as the throttleMechanism. Necessary because RAF is scoped to the current window.
    //  Leverage requestAnimationFrame for throttling function calls instead of setTimeout for better perf.
    throttleFramerate: function(throttleMechanisim, callback) {
        var wait, args, context;
        return function() {
            if (wait) return;
            wait = true;
            args = arguments;
            context = this;
            throttleMechanisim(function() {
                wait = false;
                callback.apply(context, args);
            });
        };
    }
});