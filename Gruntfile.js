/*jslint node: true*/
//	Options:
//    * grunt: Lint JavaScript, LESS, and _locales
//    * grunt build: Build a test release
//    * grunt build --newVersion=x.xxx: Build a release  
'use strict';

var _ = require('lodash');

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    //  Setup environment variables before initializing config so that initConfig can use the variables.
    var version = grunt.option('newVersion') || 'Debug';
    var isDebug = !grunt.option('newVersion');
    var releaseDirectory = 'release/Streamus v' + version;
    var chromeReleaseDirectory = releaseDirectory + '/chrome/';
    var operaReleaseDirectory = releaseDirectory + '/opera/';
    
	grunt.initConfig({
		//	Read project settings from package.json in order to be able to reference the properties with grunt.
	    pkg: grunt.file.readJSON('package.json'),
	    //  TODO: I could compress SVGs, too.
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
		        //  TODO: refactor beatportInject so I can enable this.
		        //latedef: true,
		        newcap: true,
		        nonew: true,
		        quotmark: 'single',
		        jquery: true,
		        //  TODO: maxparams, maxdepth, maxcyclomaticcomplexity, maxlen
		        //	Don't validate third-party libraries
		        ignores: ['src/js/thirdParty/**/*.js']
		    },
		    
			files: ['Gruntfile.js', 'src/js/**/*.js'],
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
				ieCompat: false,
				cwd: 'src/less/',
				src: 'foreground.less',
				dest: 'dist/css',
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
		            //  TODO: findNestedDependencies ?
					appDir: 'src',
					dir: 'dist/',
					//  Inlines the text for any text! dependencies, to avoid the separate
					//  async XMLHttpRequest calls to load those dependencies.
					inlineText: true,
					stubModules: ['text'],
					useStrict: true,
					mainConfigFile: 'src/js/common/requireConfig.js',
					//  List the modules that will be optimized. All their immediate and deep
					//  dependencies will be included in the module's file when the build is done
					modules: [{
						name: 'background/main',
						include: ['background/plugins']
					}, {
						name: 'background/application',
						exclude: ['background/main']
					}, {
						name: 'foreground/main',
						include: ['foreground/plugins']
					}, {
						name: 'foreground/application',
						exclude: ['foreground/main']
					}],
					//  Skip optimizins because there's no load benefit for an extension and it makes error debugging hard.
					optimize: 'none',
					optimizeCss: 'none',
					preserveLicenseComments: false,
					//  Don't leave a copy of the file if it has been concatenated into a larger one.
					removeCombined: true,
					fileExclusionRegExp: /^\.|vsdoc.js$|\.example$|test|test.html|less$/
				}
			}
		},
		replace: {
		    //  Update the version in manifest.json with the provided version
		    manifestVersion: {
		        src: ['src/manifest.json'],
		        overwrite: true,
		        replacements: [{
		            from: /"version": "\d{0,3}.\d{0,3}"/,
		            to: '"version": "' + version + '"'
		        }]
		    },
		    //  Replace path to requireConfig so that it can be found in a production environment
		    requireConfigPath: {
		        src: ['dist/js/**/main.js'],
		        overwrite: true,
		        replacements: [{
		            from: '../common/requireConfig',
		            to: 'common/requireConfig'
		        }]
		    },
		    //  Replace references to LESS stylesheets to CSS stylesheets
		    lessReferences: {
		        src: ['dist/foreground.html'],
		        overwrite: true,
		        replacements: [{
		            from: 'stylesheet/less',
		            to: 'stylesheet'
		        }, {
		            from: 'less',
		            to: 'css'
		        }]
		    },
		    //  Not all permissions supported on Chrome are supported on Opera. Remove them from manifest.json when building a release.
		    invalidOperaPermissions: {
		        src: [operaReleaseDirectory + '/manifest.json'],
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
		    //  Replace debugging and non-concatenated file references in manifest.json
		    transformManifest: {
		        src: ['dist/manifest.json'],
		        overwrite: true,
		        replacements: [{
		            from: /".*localhost:.*,/g,
		            to: function (match) {
		                //  Don't remove debug permissions when testing because server will throw CORS errors.
		                return isDebug ? match : '';
		            }
		        }, {
		            //  Transform inject javascript to reference uglified/concat versions for production.
		            from: '"js": ["js/thirdParty/lodash.js", "js/thirdParty/jquery.js", "js/inject/youTubeIFrameInject.js"]',
		            to: '"js": ["js/inject/youTubeIFrameInject.js"]'
		        }, {
		            from: '"js": ["js/thirdParty/lodash.js", "js/thirdParty/jquery.js", "js/inject/youTubeInject.js"]',
		            to: '"js": ["js/inject/youTubeInject.js"]'
		        }, {
		            from: '"js": ["js/thirdParty/lodash.js", "js/thirdParty/jquery.js", "js/inject/streamusShareInject.js"]',
		            to: '"js": ["js/inject/streamusShareInject.js"]'
		        }, {
		            from: '"js": ["js/thirdParty/lodash.js", "js/thirdParty/jquery.js", "js/inject/streamusInject.js"]',
		            to: '"js": ["js/inject/streamusInject.js"]'
		        }, {
		            from: '"js": ["js/thirdParty/jquery.js", "js/inject/beatportInject.js"]',
		            to: '"js": ["js/inject/beatportInject.js"]'
		        }]
		    }
		},
		compress: {
		    //	Zip up browser-specific folders which are ready for release. The .zip file is then uploaded to the appropriate store
		    release: {
		        options: {
		            //  Set this before calling the task.
		            directory: '',
		            archive: '<%= compress.release.options.directory %>' + 'Streamus v' + version + '.zip'
		        },
		        files: [{
		            expand: true,
		            cwd: '<%= compress.release.options.directory %>',
		            src: ['**']
		        }]
		    }
		},
		clean: {
		    //  Remove all non-English translations from the _locales folder in Opera because they have stricter translation requirements than what I'm willing to fulfill.
		    operaLocales: {
		        files: [{
		            expand: true,
		            cwd: operaReleaseDirectory + '/_locales/',
		            src: ['*', '!/en']
		        }]
		    },
		    //  Cleanup the dist folder of files which don't need to be pushed to production.
		    dist: {
		        files: [{
		            expand: true,
		            cwd: 'dist/',
		            //  TODO: Prevent copying template through requirejs config
		            src: ['template', 'build.txt']
		        }]
		    }
		},
		copy: {
		    distToOpera: {
		        expand: true,
		        cwd: 'dist/',
		        src: '**/*',
		        dest: operaReleaseDirectory
		    },
		    distToChrome: {
		        expand: true,
		        cwd: 'dist/',
		        src: '**/*',
		        dest: chromeReleaseDirectory
		    }
		},
		concat: {
		    //  Injected JavaScript does not use RequireJS so they need to be concatenated and moved to dist with a separate task
		    //  TODO: Can I keep this code more DRY?
		    injectedJs: {
		        'dist/js/inject/beatportInject.js': ['src/js/thirdParty/jquery.js', 'src/js/inject/beatportInject.js'],
		        'dist/js/inject/streamusInject.js': ['src/js/thirdParty/jquery.js', 'src/js/thirdParty/lodash.js', 'src/js/inject/streamusInject.js'],
		        'dist/js/inject/streamusShareInject.js': ['src/js/thirdParty/jquery.js', 'src/js/thirdParty/lodash.js', 'src/js/inject/streamusShareInject.js'],
		        'dist/js/inject/youTubeInject.js': ['src/js/thirdParty/jquery.js', 'src/js/thirdParty/lodash.js', 'src/js/inject/youTubeInject.js'],
		        'dist/js/inject/youTubeIFrameInject.js': ['src/js/thirdParty/jquery.js', 'src/js/thirdParty/lodash.js', 'src/js/inject/youTubeIFrameInject.js']
		    }
		}
	});

	grunt.registerTask('build', 'Build release and place .zip files in /release directory.', function () {
	    //  Ensure tests pass before performing any sort of bundling.
	    grunt.task.run('test');
	    
        //  TODO: This should also update package.json
	    if (!isDebug) {
	        grunt.task.run('replace:manifestVersion');
	    }

		//  It's necessary to run requireJS before other steps because it will overwrite replace:transformManifest.
		grunt.task.run('requirejs');
		grunt.task.run('replace:transformManifest', 'replace:localDebug', 'concat:injectedJs', 'less', 'replace:lessReferences', 'imagemin', 'replace:requireConfigPath', 'clean:dist');
	    
        //  Build chrome release
	    grunt.config.set('compress.release.options.directory', chromeReleaseDirectory);
	    grunt.task.run('copy:distToChrome', 'compress:release');
	    
        //  Build opera release
	    grunt.config.set('compress.release.options.directory', operaReleaseDirectory);
		grunt.task.run('copy:distToOpera', 'replace:invalidOperaPermissions', 'clean:operaLocales', 'compress:release');
	});

	grunt.registerTask('diffLocales', 'ensure that all of the message.json files located under _locales are in-sync with the English version', function () {
	    var englishJson = grunt.file.readJSON('src/_locales/en/messages.json');
	    var englishKeys = _.keys(englishJson);

	    grunt.file.recurse('src/_locales/', function (abspath, rootdir, subdir) {
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
};