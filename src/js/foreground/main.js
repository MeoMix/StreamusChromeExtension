require([
    //  Start by loading the requireJS configuration file:
    '../common/requireConfig'
], function () {
    'use strict';

    //  The foreground can be destroyed but with a log message still attempting to run from an event. This wrapper ensures logging doesn't throw errors.
    window.console = window && console;

    //  Load all of the plugins needed by the foreground:
    require(['foreground/plugins']);
});