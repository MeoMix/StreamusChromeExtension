define(function(require) {
  'use strict';

  // Load independent modules for each group of tests instead of one giant dumping ground for all of them.
  require('test/background/backgroundSpecLoader');
  require('test/common/commonSpecLoader');
  require('test/contentScript/contentScriptSpecLoader');
  require('test/foreground/foregroundSpecLoader');
});