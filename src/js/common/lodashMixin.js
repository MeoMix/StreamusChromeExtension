define({
    //  Inspired by: https://gist.github.com/danro/7846358
    //  Leverage requestAnimationFrame for throttling function calls instead of setTimeout for better perf.
    throttleFramerate: function(callback) {
        var wait, args, context;
        return function() {
            if (wait) return;
            wait = true;
            args = arguments;
            context = this;
            requestAnimationFrame(function() {
                wait = false;
                callback.apply(context, args);
            });
        };
    }
});