// Options:
// * grunt: Lint JavaScript, LESS, and run tests
// * grunt build: Build a debug release
// * grunt build:release: Build a release / increment version
// * grunt compile: Move files from /src to /compiled and compile LESS and JavaScript. Start watch task to monitor changes.
var _ = require('lodash');
var Builder = require('systemjs-builder');
var Rsvp = require('rsvp');

module.exports = function(grunt) {
  // Use jit-grunt to improve task initialization times. Only load modules as needed.
  require('jit-grunt')(grunt, {
    replace: 'grunt-text-replace'
  });

  var compiledFileTargets = ['**/*', '!**/background/**', '!**/common/**', '**/common/shim/lodash.reference.shim.js', '**/common/templates.js', '!**/contentScript/youTubePlayer/**', '!**/foreground/**', '!**/test/**', '!**/less/**', '**/main.js'];

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
    htmlmin: {
      options: {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        removeOptionalTags: true
      },
      dist: {
        files: {
          'dist/background.html': 'dist/background.html',
          'dist/foreground.html': 'dist/foreground.html'
        }
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

      files: ['src/js/**/*.js']
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
      compiled: {
        expand: true,
        cwd: 'src/less/',
        src: 'foreground.less',
        ext: '.css',
        dest: 'compiled/css/'
      },
      dist: {
        expand: true,
        cwd: 'src/less/',
        src: 'foreground.less',
        ext: '.css',
        dest: 'dist/css/'
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
    replace: {
      // Remove Chrome permissions not supported on other browsers.
      invalidPermissions: {
        src: ['<%= meta.releaseDirectory %>/manifest.json'],
        overwrite: true,
        replacements: [
          {
            from: '"background",',
            to: ''
          }, {
            from: '"identity.email",',
            to: ''
          }
        ]
      },
      // Ensure that the localDebug flag is not set to true when building a release.
      localDebug: {
        src: ['dist/js/background/main.js'],
        overwrite: true,
        replacements: [
          {
            // Local debugging is for development only.
            from: 'localDebug: true',
            to: 'localDebug: false'
          }
        ]
        //}, {
        //  from: 'referer = \'https://streamus.com\/',
        //  to: 'referer = \'https://streаmus.com\/'
        //}]
      },
      // Remove comments and unbundled file references
      manifestCleanup: {
        src: ['dist/manifest.json'],
        overwrite: true,
        replacements: [
          {
            // Remove comments because they can't be uploaded to the web store.
            from: /\/\/ .*/ig,
            to: ''
          }, {
            from: '"js/lib/jspm_packages/system.js", "js/lib/jspm.config.js", ',
            to: ''
          }
        ]
      },
      // Remove manifest key
      manifestKey: {
        src: ['dist/manifest.json'],
        overwrite: true,
        replacements: [
          {
            // Remove manifest key because it can't be uploaded to the web store.
            // The key is helpful for debugging because it keeps the extension ID stable.
            from: /"key".*/,
            to: ''
          }
        ]
      },
      htmlBundle: {
        src: ['dist/*.html'],
        overwrite: true,
        replacements: [
          {
            from: '<script src=\'js/lib/jspm_packages/system.js\'></script>',
            to: ''
          }, {
            from: '<script src=\'js/lib/jspm.config.js\'></script>',
            to: ''
          }
        ]
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
        mtimeUpdate: true,
        // Force directories to update their modified time.
        timestamp: true
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
        src: compiledFileTargets,
        dest: 'compiled/'
      },
      // Move non-compiled files to distribution folder.
      dist: {
        expand: true,
        cwd: 'src/',
        src: ['js/contentScript/*.js', 'js/contentScript/youTubePlayer/sandboxInject.js', 'js/contentScript/youTubePlayer/playerApi.js', 'css/contentScript/*.css', 'img/**', 'font/**', '_locales/**', 'background.html', 'foreground.html', 'manifest.json'],
        dest: 'dist/'
      }
    },
    jscs: {
      src: ['src/js/**/*.js', '!src/js/lib/**/*.js'],
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
          logErrors: true,
          run: false,
          inject: '',
          urls: ['http://localhost:8888/test.html']
        }
      }
    },
    // Create the key file YouTube's API using the testing key (NOT the production key).
    // Used for Travis CI builds.
    'file-creator': {
      youTubeAPIKey: {
        'src/js/background/key/youTubeAPIKey.js': function(fs, fd, done) {
          fs.writeSync(fd, 'export default \'AIzaSyBZcQXI0oPbD2QtC74jDfkfpk_81TYrDcU\';');
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
          src: ['**/*.js', '!**/main.js', '!**/lib/**', '!**/common/shim/lodash.reference.shim.js', '!**/common/templates.js'],
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
        files: compiledFileTargets,
        tasks: ['newer:copy:compiled']
      },
      // Compile and copy ES6 files to 'compiled' directory. Exclude main files because they're not ES6.
      copyCompiled: {
        options: {
          event: ['added', 'changed'],
          cwd: 'src/js'
        },
        files: ['background/**/*', 'common/**/*', '**/contentScript/youTubePlayer/**', 'foreground/**/*', 'test/**/*', '!**/main.js'],
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
    'template-module': {
      compile: {
        options: {
          module: true,
          provider: 'lodash',
          processName: function(filename) {
            return filename.replace('src/template/', '').replace('.html', '').replace('.svg', '').replace(/\//g, '_');
          },
          templateSettings: {
            
          }
        },
        files: {
          "src/js/common/templates.js": ["src/js/template/*.html", "src/template/**/*.html", "src/template/**/*.svg"]
        }
      }
    }
  });

  grunt.event.on('watch', function(action, filepath) {
    if (action === 'deleted') {
      // Drop src off of filepath to properly rely on 'cwd' task configuration.
      grunt.config('clean.compiledFile.src', filepath.replace('src\\', ''));
    }
  });

  grunt.registerTask('compile', ['template-module', 'copy:compiled', 'babel:compiled', 'less:compiled', 'watch']);

  grunt.registerTask('buildDist', function() {
    grunt.task.run('copy:dist', 'less:dist');

    var backgroundBuilder = new Builder(undefined, 'src/js/lib/jspm.config.js');
    backgroundBuilder.loader.baseURL += 'src/';

    var foregroundBuilder = new Builder(undefined, 'src/js/lib/jspm.config.js');
    foregroundBuilder.loader.baseURL += 'src/';

    var youTubePlayerBuilder = new Builder(undefined, 'src/js/lib/jspm.config.js');
    youTubePlayerBuilder.loader.baseURL += 'src/';

    var done = this.async();
    var options = {
      runtime: false,
      sourceMaps: false,
      true: false
    };

    Rsvp.Promise.all([
      backgroundBuilder.buildSFX('js/background/plugins.js', 'dist/js/background/main.js', options),
      foregroundBuilder.buildSFX('js/foreground/plugins.js', 'dist/js/foreground/main.js', options),
      youTubePlayerBuilder.buildSFX('js/contentScript/youTubePlayer/plugins.js', 'dist/js/contentScript/youTubePlayer/main.js', options)
    ]).then(function() {
      grunt.task.run('replace:manifestCleanup', 'replace:htmlBundle');
      done();
    }).catch(function(error) {
      console.log('buildSFX error:', error);
      done();
    });
  });

  //  Build release and place .zip files in the release directory
  grunt.registerTask('build', function(buildFlag) {
    var isRelease = buildFlag === 'release';

    // Ensure tests pass before allowing a release.
    if (isRelease) {
      grunt.task.run('test', 'version:project:minor');
    }

    grunt.task.run('buildDist');

    // Don't replace manifest key during debugging because server will throw CORS errors.
    if (isRelease) {
      grunt.task.run('replace:manifestKey');
    }
    
    grunt.task.run('replace:localDebug', 'imagemin', 'htmlmin', 'buildReleases:' + isRelease);
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