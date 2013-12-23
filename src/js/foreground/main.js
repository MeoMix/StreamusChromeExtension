//  Start by loading the requireJS configuration file which is kept DRY between all pages:
require([
    '../requireConfig'
], function () {
    'use strict';

    //  The foreground can be destroyed, but with a log message still attempting to execute. This wrapper ensures logging doesn't throw errors.
    window.console = window && console;

    //  Then, load all of the plugins needed by the foreground:
    require(['foreground/plugins']);
});