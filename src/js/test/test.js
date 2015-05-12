define(function(require) {
    'use strict';

    //  Load independent modules for each group of tests instead of one giant dumping ground for all of them.
    require('test/background/backgroundTests');
    require('test/common/commonTests');
    require('test/foreground/foregroundTests');
});