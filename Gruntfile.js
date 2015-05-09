/*jslint node: true*/
//	Options:
//    * grunt: Lint JavaScript, LESS, and _locales
//    * grunt build: Build a test release
//    * grunt build --newVersion="vx.xxx": Build a release  
'use strict';

var _ = require('lodash');

module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    //  Setup environment variables before initializing config so that initConfig can use the variables.
    var versionParameter = grunt.option('newVersion');
    //  Strip out v because need to pass a string to grunt or else trailing zeros get dropped (i.e. can't provide --newVersion=0.170, interpreted as 0.17)
    var version = _.isUndefined(versionParameter) ? 'Debug' : versionParameter.replace('v', '');
    var isDebug = !versionParameter;
    var baseReleaseDirectory = 'release/Streamus v' + version;
    var chromeReleaseDirectory = baseReleaseDirectory + '/chrome/';
    var operaReleaseDirectory = baseReleaseDirectory + '/opera/';

    grunt.initConfig({
        //	Read project settings from package.json in order to be able to reference the properties with grunt.
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            //  Set this value dynamically to inform other packages where to write information.
            releaseDirectory: ''
        },
        //  Compress image sizes and move to dist folder
        imagemin: {
            files: {
                expand: true,
                cwd: 'dist/img',
                src: ['**/*.{png,jpg,gif}'],
                dest: 'dist/img/'
            }
        },
        //	Improve code quality by applying a code-quality check with jshint
        jshint: {
            //  A full list of options and their defaults here: https://github.com/jshint/jshint/blob/master/examples/.jshintrc
            options: {
                camelcase: true,
                immed: true,
                latedef: true,
                newcap: true,
                nonew: true,
                quotmark: 'single',
                jquery: true,
                maxparams: 5,
                maxdepth: 4,
                maxstatements: 25,
                maxcomplexity: 10,
                maxlen: 200,
                //	Don't validate third-party libraries
                ignores: ['src/js/thirdParty/**/*.js']
            },

            files: ['src/js/**/*.js'],
        },
        //  Compile LESS to CSS
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
                dest: 'src/css/',
                ext: '.css'
            }
        },
        //  Ensure LESS code-quality by comparing it against Twitter's ruleset.
        //  Using a slightly modified version which has support for modern browser properties
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
                //  All r.js options can be found here: https://github.com/jrburke/r.js/blob/master/build/example.build.js
                options: {
                    appDir: 'src',
                    mainConfigFile: 'src/js/common/requireConfig.js',
                    dir: 'dist/',
                    //  Skip optimizing because there's no load benefit for an extension and it makes error debugging hard.
                    optimize: 'none',
                    optimizeCss: 'none',
                    //  Inlines the text for any text! dependencies, to avoid the separate
                    //  async XMLHttpRequest calls to load those dependencies.
                    inlineText: true,
                    useStrict: true,
                    stubModules: ['text'],
                    findNestedDependencies: true,
                    //  Don't leave a copy of the file if it has been concatenated into a larger one.
                    removeCombined: true,
                    //  List the modules that will be optimized. All their immediate and deep
                    //  dependencies will be included in the module's file when the build is done
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
            //  Update the version in manifest.json and package.json with the provided version
            updateVersion: {
                src: ['src/manifest.json', 'package.json'],
                overwrite: true,
                replacements: [{
                    from: /"version": "\d{0,3}.\d{0,3}"/,
                    to: '"version": "' + version + '"'
                }]
            },
            //  Not all Chrome permissions supported on other browsers (Opera). Remove them from manifest.json when building a release.
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
            //  Ensure that the localDebug flag is not set to true when building a release.
            localDebug: {
                src: ['dist/js/background/background.js'],
                overwrite: true,
                replacements: [{
                    //	Find the line that looks like: "localDebug: true" and set it to false. Local debugging is for development only.
                    from: 'localDebug: true',
                    to: 'localDebug: false'
                }]
            },
            //  Remove development key and comments from manifest for deployment
            transformManifest: {
                src: ['dist/manifest.json'],
                overwrite: true,
                replacements: [{
                    //  Remove manifest key because it can't be uploaded to the web store, but it's helpful to have in debugging to keep the extension ID stable.
                    from: /"key".*/,
                    to: function(match) {
                        //  Don't remove key when testing because server will throw CORS errors.
                        return isDebug ? match : '';
                    }
                }, {
                    //  Remove comments because they can't be uploaded to the web store.
                    from: /\/\/ .*/ig,
                    to: ''
                }]
            }
        },
        compress: {
            //	Zip up browser-specific folders which are ready for release. The .zip file is then uploaded to the appropriate store
            release: {
                options: {
                    archive: '<%= meta.releaseDirectory %>Streamus v' + version + '.zip'
                },
                files: [{
                    expand: true,
                    cwd: '<%= meta.releaseDirectory %>',
                    src: ['**']
                }]
            }
        },
        clean: {
            //  Remove all non-English translations from the _locales folder (in Opera) because translation requirements are stricter than what I'm willing to fulfill.
            locales: {
                files: [{
                    expand: true,
                    cwd: '<%= meta.releaseDirectory %>/_locales/',
                    src: ['*', '!en']
                }]
            },
            //  Cleanup the dist folder of files which don't need to be pushed to production.
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: ['template', 'build.txt']
                }]
            }
        },
        copy: {
            release: {
                expand: true,
                cwd: 'dist/',
                src: '**/*',
                dest: '<%= meta.releaseDirectory %>'
            }
        },
        concat: {
            //  TODO: This isn't really a concat anymore. Just a copy operation.
            //  Content scripts don't use RequireJS so they need to be concatenated and moved to dist with a separate task
            contentScripts: {
                files: {
                    'dist/js/contentScript/beatport.js': ['src/js/contentScript/beatport.js'],
                    'dist/js/contentScript/youTube.js': ['src/js/contentScript/youTube.js'],
                    'dist/js/contentScript/youTubeIFrame.js': ['src/js/contentScript/youTubeIFrame.js']
                }
            }
        },
        watch: {
            less: {
                options: {
                    nospawn: true
                },
                files: ['src/less/*'],
                tasks: ['less']
            }
        }
    });

    grunt.registerTask('build', 'Build release and place .zip files in /release directory.', function() {
        //  Ensure tests pass before performing any sort of bundling.
        grunt.task.run('test');

        if (!isDebug) {
            grunt.task.run('replace:updateVersion');
        }

        grunt.task.run('requirejs', 'replace:transformManifest', 'replace:localDebug', 'concat:contentScripts', 'less', 'imagemin', 'clean:dist');

        //  Build chrome release
        grunt.task.run('compressRelease:' + chromeReleaseDirectory);
        //  Build opera release
        grunt.task.run('compressRelease:' + operaReleaseDirectory + ':sanitize=true');
    });

    grunt.registerTask('diffLocales', 'ensure that all of the message.json files located under _locales are in-sync with the English version', function() {
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

    grunt.registerTask('default', 'An alias task for running tests.', ['test']);

    grunt.registerTask('test', 'Run tests and code-quality analysis', ['diffLocales', 'jshint', 'recess']);

    grunt.registerTask('compressRelease', 'A synchronous wrapper around compress:release', function(releaseDirectory, sanitize) {
        grunt.config.set('meta.releaseDirectory', releaseDirectory);
        grunt.task.run('copy:release');

        if (sanitize) {
            grunt.task.run('replace:invalidPermissions', 'clean:locales');
        }

        grunt.task.run('compress:release');
    });
};