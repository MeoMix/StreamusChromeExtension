'use strict';
// Load independent modules for each group of tests instead of one giant dumping ground for all of them.
import 'test/background/backgroundSpecLoader';
import 'test/common/commonSpecLoader';
import 'test/contentScript/contentScriptSpecLoader';
import 'test/foreground/foregroundSpecLoader';