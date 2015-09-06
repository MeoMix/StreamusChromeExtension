/*jslint node: true*/
// Options:
// * grunt: Lint JavaScript, LESS, and run tests
// * grunt build: Build a debug release
// * grunt build:release: Build a release / increment version
var _ = require('lodash');

module.exports = function(grunt) {
  // Use jit-grunt to improve task initialization times. Only load modules as needed.
  require('jit-grunt')(grunt);

  grunt.initConfig({
    //	Read project settings from package.json in order to be able to reference the properties with grunt.
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      // Set these values dynamically to inform packages where to write information.
      releaseDirectory: '',
      buildVersion: ''
    },
    // Compress image sizes and move to dist folder
    imagemin: {
      files: {
        expand: true,
        cwd: 'dist/img',
        src: ['**/*.{png,jpg,gif}'],
        dest: 'dist/img/'
      }
    },
    // Improve code quality by applying a code-quality check with jshint
    jshint: {
      // A full list of options and their defaults here: https://github.com/jshint/jshint/blob/master/examples/.jshintrc
      options: {
        immed: true,
        latedef: true,
        newcap: true,
        nonew: true,
        quotmark: 'single',
        jquery: true,
        maxparams: 5,
        maxdepth: 4,
        maxstatements: 35,
        maxcomplexity: 10,
        // Allow ES6 conventions
        esnext: true,
        // Don't validate libraries
        ignores: ['src/js/lib/**/*.js']
      },

      files: ['src/js/**/*.js', 'Gruntfile.js']
    },
    // Compile LESS to CSS
    less: {
      options: {
        ieCompat: false,
        compress: true,
        strictImports: true,
        strictMath: true,
        strictUnits: true
      },

      files: {
        expand: true,
        cwd: 'src/less/',
        src: 'foreground.less',
        dest: 'compiled/css/',
        ext: '.css'
      }
    },
    // Ensure LESS code-quality by comparing it against Twitter's ruleset.
    // Using a slightly modified version which has support for modern browser properties
    recess: {
      foreground: {
        src: 'src/less/foreground.less',
        options: {
          noUniversalSelectors: false,
          strictPropertyOrder: false
        }
      }
    },
    requirejs: {
      production: {
        // All r.js options can be found here: https://github.com/jrburke/r.js/blob/master/build/example.build.js
        options: {
          appDir: 'src',
          mainConfigFile: 'src/js/common/requireConfig.js',
          dir: 'dist/',
          // Skip optimizing because there's no load benefit for an extension and it makes error debugging hard.
          optimize: 'none',
          optimizeCss: 'none',
          // Inlines the text for any text! dependencies, to avoid the separate
          // async XMLHttpRequest calls to load those dependencies.
          inlineText: true,
          useStrict: true,
          stubModules: ['text'],
          findNestedDependencies: true,
          // Don't leave a copy of the file if it has been concatenated into a larger one.
          removeCombined: true,
          // List the modules that will be optimized. All their immediate and deep
          // dependencies will be included in the module's file when the build is done
          modules: [{
            name: 'background/main',
            insertRequire: ['background/main']
          }, {
            name: 'foreground/main',
            insertRequire: ['foreground/main']
          }],
          fileExclusionRegExp: /^\.|vsdoc.js$|\.example$|test|test.html|less$/
        }
      }
    },
    replace: {
      // Remove Chrome permissions not supported on other browsers.
      invalidPermissions: {
        src: ['<%= meta.releaseDirectory %>/manifest.json'],
        overwrite: true,
        replacements: [{
          from: '"background",',
          to: ''
        }, {
          from: '"identity.email",',
          to: ''
        }]
      },
      // Ensure that the localDebug flag is not set to true when building a release.
      localDebug: {
        src: ['dist/js/background/background.js'],
        overwrite: true,
        replacements: [{
          // Local debugging is for development only.
          from: 'localDebug: true',
          to: 'localDebug: false'
        }]
        //}, {
        //  from: 'referer = \'https://streamus.com\/',
        //  to: 'referer = \'https://streаmus.com\/'
        //}]
      },
      // Remove development key and comments from manifest for deployment
      manifest: {
        src: ['dist/manifest.json'],
        overwrite: true,
        replacements: [{
          // Remove manifest key because it can't be uploaded to the web store.
          // The key is helpful for debugging because it keeps the extension ID stable.
          from: /"key".*/,
          to: ''
        }, {
          // Remove comments because they can't be uploaded to the web store.
          from: /\/\/ .*/ig,
          to: ''
        }]
      }
    },
    compress: {
      //	Zip browser-specific folders which are ready for release.
      //  Each zip file can then be uploaded to their respective web store.
      release: {
        options: {
          archive: '<%= meta.releaseDirectory %>Streamus v<%= meta.buildVersion %>.zip'
        },
        files: [{
          expand: true,
          cwd: '<%= meta.releaseDirectory %>',
          src: ['**']
        }]
      }
    },
    clean: {
      // Remove all non-English translations from Opera because their translation requirements are too strict.
      locales: {
        files: [{
          expand: true,
          cwd: '<%= meta.releaseDirectory %>/_locales/',
          src: ['*', '!en']
        }]
      },
      // Cleanup the dist folder of files which don't need to be pushed to production.
      dist: {
        files: [{
          expand: true,
          cwd: 'dist/',
          src: ['template', 'build.txt']
        }]
      },
      compiledFile: {
        expand: true,
        cwd: 'compiled',
        // Set via grunt.event.on('watch') event handler
        src: ''
      }
    },
    copy: {
      options: {
        // Force file modified time to update so that grunt-newer is able to know not to copy to dest multiple times.
        mtimeUpdate: true
      },
      release: {
        expand: true,
        cwd: 'dist/',
        src: '**/*',
        dest: '<%= meta.releaseDirectory %>'
      },
      compiled: {
        expand: true,
        cwd: 'src/',
        // Exclude ES6-enabled JavaScript files which will be copied during transpilation.
        // Exclude LESS files which will be copied during compilation.
        src: ['**/*', '!**/background/**', '!**/common/**', '!**/foreground/**', '!src/**/test/**', '!**/less/**', '**/main.js'],
        dest: 'compiled/'
      },
      // Content scripts don't use RequireJS so they need to be concatenated and moved to dist with a separate task
      contentScripts: {
        files: {
          'dist/js/contentScript/beatport.js': ['src/js/contentScript/beatport.js'],
          'dist/js/contentScript/youTube.js': ['src/js/contentScript/youTube.js']
        }
      }
    },
    jscs: {
      src: ['src/js/**/*.js', '!src/js/lib/**/*.js', 'Gruntfile.js'],
      options: {
        config: '.jscsrc',
        fix: true
      }
    },
    connect: {
      server: {
        options: {
          port: 8888,
          base: './src'
        }
      }
    },
    mocha: {
      tests: {
        options: {
          log: true,
          run: false,
          inject: '',
          urls: ['http://localhost:8888/test.html']
        }
      }
    },
    // Create the key file YouTube's API using the testing key (NOT the production key).
    // Used mainly for Travis CI builds.
    'file-creator': {
      youTubeAPIKey: {
        'src/js/background/key/youTubeAPIKey.js': function(fs, fd, done) {
          fs.writeSync(fd, 'define(function() { return \'AIzaSyDBCJuq0aey3bL3K6C0l4mKzT_y8zy9Msw\'; });');
          done();
        }
      }
    },
    version: {
      project: {
        options: {
          prefix: '[^\\-minimum_chrome_version]version[\'"]?\\s*[:=]\\s*[\'"]'
        },
        src: ['package.json', 'src/manifest.json']
      }
    },
    'webstore-upload': {
      accounts: {
        'default': {
          publish: false
        }
      },
      extensions: {
        streamus: {
          appID: 'jbnkffmindojffecdhbbmekbmkkfpmjd',
          zip: 'release/Streamus v<%= meta.buildVersion %>/chrome/Streamus v<%= meta.buildVersion %>.zip'
        }
      }
    },
    babel: {
      options: {
        modules: 'system'
      },
      compiled: {
        files: [{
          expand: true,
          cwd: 'src',
          // Exclude compiling main.js because it holds System.import.
          src: ['**/*.js', '!**/main.js', '!**/lib/**'],
          dest: 'compiled'
        }]
      }
    },

    // NOTE: Spawn must be disabled to keep watch running under same context in order to dynamically modify config file.
    watch: {
      // Compile LESS files to 'compiled' directory.
      less: {
        options: {
          interrupt: true,
          cwd: 'src/less'
        },
        files: ['**/*.less'],
        tasks: ['less']
      },
      // Copy all non-ES6/LESS files to 'compiled' directory.
      // Include main files because they're not ES6. Exclude LESS because they're compiled.
      copyUncompiled: {
        options: {
          event: ['added', 'changed'],
          cwd: 'src'
        },
        files: ['**/*', '!**/background/**', '!**/common/**', '!**contentScript/youTubePlayer/**/*',
          '!**/foreground/**', '!**/test/**', '!**/less/**', '**/main.js'],
        tasks: ['newer:copy:compiled']
      },
      // Compile and copy ES6 files to 'compiled' directory. Exclude main files because they're not ES6.
      copyCompiled: {
        options: {
          event: ['added', 'changed'],
          cwd: 'src/js'
        },
        files: ['background/**/*', 'common/**/*', '**contentScript/youTubePlayer/**/*', 'foreground/**/*', 'test/**/*', '!**/main.js'],
        tasks: ['newer:babel:compiled']
      },
      // Whenever a file is deleted from 'src' ensure it is also deleted from 'compiled'
      remove: {
        options: {
          event: ['deleted'],
          spawn: false,
          cwd: 'src'
        },
        files: ['**/*'],
        tasks: ['clean:compiledFile']
      }
    },

    shell: {
      jspm: {
        command: ['jspm bundle-sfx background/plugins backgroundmain.js', 'jspm bundle-sfx foreground/plugins foregroundmain.js'].join('&&')
      }
    }
  });

  grunt.event.on('watch', function(action, filepath) {
    if (action === 'deleted') {
      // Drop src off of filepath to properly rely on 'cwd' task configuration.
      grunt.config('clean.compiledFile.src', filepath.replace('src\\', ''));
    }
  });

  grunt.registerTask('compile', ['copy:compiled', 'babel:compiled', 'less']);

  //  Build release and place .zip files in the release directory
  grunt.registerTask('build', function(buildFlag) {
    var isRelease = buildFlag === 'release';
    // Ensure tests pass before performing any sort of bundling.
    grunt.task.run('test');

    if (isRelease) {
      grunt.task.run('version:project:minor');
    }

    grunt.task.run('requirejs');

    // Don't replace manifest key during debugging because server will throw CORS errors.
    // No need to clean-up comments because debug version isn't uploaded
    if (isRelease) {
      grunt.task.run('replace:manifest');
    }

    grunt.task.run('replace:localDebug', 'copy:contentScripts', 'less', 'imagemin', 'clean:dist');
    grunt.task.run('buildReleases:' + isRelease);
  });

  // Ensure that non-English translations are in-sync with the English translation
  grunt.registerTask('diffLocales', function() {
    var englishJson = grunt.file.readJSON('src/_locales/en/messages.json');
    var englishKeys = _.keys(englishJson);

    grunt.file.recurse('src/_locales/', function(abspath, rootdir, subdir) {
      var json = grunt.file.readJSON(abspath);
      var keys = _.keys(json);

      var missingEnglishKeys = _.difference(englishKeys, keys);
      var extraNonEnglishKeys = _.difference(keys, englishKeys);

      if (missingEnglishKeys.length > 0) {
        grunt.log.error('The translation for ' + subdir + ' is missing keys: \n-  ' + missingEnglishKeys.join('\n-  '));
      }

      if (extraNonEnglishKeys.length > 0) {
        grunt.log.error('The translation for ' + subdir + ' has extra keys: \n-  ' + extraNonEnglishKeys.join('\n-  '));
      }
    });
  });

  // Run linters and enforce code-quality standards
  grunt.registerTask('default', ['test']);
  grunt.registerTask('test', ['jshint', 'recess', 'jscs', 'connect', 'mocha']);

  // Synchronous wrapper
  grunt.registerTask('buildReleases', function(isRelease) {
    var buildVersion = isRelease === 'true' ? grunt.file.readJSON('package.json').version : 'Debug';
    grunt.config.set('meta.buildVersion', buildVersion);
    var baseReleaseDirectory = 'release/Streamus v' + buildVersion;
    var chromeReleaseDirectory = baseReleaseDirectory + '/chrome/';
    var operaReleaseDirectory = baseReleaseDirectory + '/opera/';

    // Build chrome release
    grunt.task.run('compressRelease:' + chromeReleaseDirectory);
    // Build opera release
    grunt.task.run('compressRelease:' + operaReleaseDirectory + ':sanitize=true');

    if (isRelease === 'true') {
      grunt.task.run('webstore-upload');
    }
  });

  // A synchronous wrapper for compress:release
  grunt.registerTask('compressRelease', function(releaseDirectory, sanitize) {
    grunt.config.set('meta.releaseDirectory', releaseDirectory);
    grunt.task.run('copy:release');

    if (sanitize) {
      grunt.task.run('replace:invalidPermissions', 'clean:locales');
    }

    grunt.task.run('compress:release');
  });
};