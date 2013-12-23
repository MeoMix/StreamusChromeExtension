/*jslint node: true*/
//	Provides methods which may be executed from the command prompt by being in this files cwd.
//	Type grunt to run the default method, or "grunt paramater" to run a specific method.
//
//	Options:
//		*	grunt: Start up a server, run Jasmine test cases, watch for changes.
//		*	grunt test: Start up a server, run Jasmine test cases.
//		*	grunt lint: Display linter errors about the project
//		*	grunt dist: Create a dist folder with a .zip containing the extension ready to be uploaded
//
//	See here for more information: http://gruntjs.com/sample-gruntfile
'use strict';

module.exports = function (grunt) {

	grunt.initConfig({

		//	Read project settings from package.json in order to be able to reference the properties with grunt.
		pkg: grunt.file.readJSON('package.json'),

	    //	Tasks:

	    //  Prepare CSS for deployment by combining into larger files.
	    //  More options are applied by useminPrepare's evaluation of .html files
		concat: {
		    options: {
		        separator: ';',
		        stripBanners: true
		    }
		},

		htmlmin: {
		    dist: {
		        options: {
		            removeComments: true,
		            collapseWhitespace: true,
		            collapseBooleanAttributes: true,
		            removeAttributeQuotes: true,
		            removeRedundantAttributes: true,
		            useShortDoctype: true,
		            removeEmptyAttributes: true,
		            removeOptionalTags: true
		        },
		        expand: true,
		        cwd: 'dist',
		        dest: 'dist/',
		        src: ['**/*.html']
		    }
		},

		//	Connect spins up tiny, quick servers for testing on
		connect: {
			test: {
				port: 8000
			}
		},

		//	Jasmine is for running our test cases. This runs in a headless web browser using phantom-js which is pretty sweet.
		jasmine: {
			//	Here's all the JavaScript I want to consider when running test cases
			src: 'app/js/*.js',
			options: {
				//	Specs are all the cases I want to run
				specs: 'test/js/spec/*Spec.js',
				//	Don't run under file:// because some APIs don't respond well to that
				host: 'http://localhost:8000/',
				template: require('grunt-template-jasmine-requirejs'),
				templateOptions: {
					requireConfigFile: 'test/js/main.js',
					requireConfig: {
						//	Override the base URL with one relative to the gruntfile.
						baseUrl: 'app/js/',
						//	Emulate main.js' initialization logic.
						deps: ['settings', 'backbone', 'jquery','lodash'],
						callback: function (Settings, Backbone, $, _) {
							//	Enable testing in Settings so configuration values can be set accordingly (API keys, etc. testing runs on localhost)
							Settings.set('testing', true);
							//	Testing should hit a local server and not be ran against the production database.
							Settings.set('localDebug', true);
						}
					}
				}
			}
		},

		//	Improve code quality by applying a code-quality check with jshint
		jshint: {
			//	Files to analyze: 
			files: ['Gruntfile.js', 'app/js/**/*.js', 'test/js/**/*.js'],
			
			options: {
				//	Override JSHint defaults for the extension
				globals: {
					jQuery: true,
					console: true
				},

                //  TODO: I'd like to remove this relaxation from the linter at some point.
				"eqnull": true,

				//	Don't validate third-party libraries
				ignores: ['app/js/thirdParty/**/*.js']
			}
		},
		
		requirejs: {
		    production: {
		        options: {
		            appDir: 'src',
		            dir: 'dist/',
		            //  Inlines the text for any text! dependencies, to avoid the separate
		            //  async XMLHttpRequest calls to load those dependencies.
		            inlineText: true,
		            stubModules: ['text'],
		            useStrict: true,
		            mainConfigFile: 'src/js/requireConfig.js',
		            //  List the modules that will be optimized. All their immediate and deep
		            //  dependencies will be included in the module's file when the build is done
                    //  TODO: Options and FullScreen both need updating.
		            //modules: [{
		            //    name: 'background/main',
                    //    include: ['background/plugins']
		            //}, {
		            //    name: 'background/background',
		            //    exclude: ['background/main', 'background/plugins']
		            //}, {
		            //    name: 'foreground/main',
                    //    include: ['foreground/plugins']
		            //}, {
		            //    name: 'foreground/foreground',
		            //    include: ['foreground/view/backgroundDependentForegroundView'],
		            //    exclude: ['foreground/main']
		            //}],
		            modules: [{
		                name: 'background/main'
		            }, {
                        name: 'foreground/main'
		            }],
		            findNestedDependencies: true,
		            optimize: 'uglify2',
		            //  Skip CSS optimizations in RequireJS step -- handle with cssmin because it supports multiple CSS files.
		            optimizeCss: 'none',
		            preserveLicenseComments: false,
		            //  Don't leave a copy of the file if it has been concatenated into a larger one.
		            removeCombined: true,
		            //  Skip files which start with a . or end in vs-doc.js
		            fileExclusionRegExp: /^\.|vsdoc.js$|.css$/
		        }

			}
		},

        //  TODO: Is this actually minifying? The files still seem abnormally large.
		uglify: {
		    inject: {
		        files: {
		            'dist/js/inject/beatportInject.js': ['src/js/thirdParty/jquery.js', 'src/js/thirdParty/bootstrap.min.js', 'src/js/inject/beatportInject.js'],
		            'dist/js/inject/streamusInject.js': ['src/js/thirdParty/jquery.js', 'src/js/thirdParty/lodash.js', 'src/js/inject/streamusInject.js'],
		            'dist/js/inject/streamusShareInject.js': ['src/js/thirdParty/jquery.js', 'src/js/thirdParty/lodash.js', 'src/js/inject/streamusShareInject.js'],
		            'dist/js/inject/youTubeInject.js': ['src/js/thirdParty/jquery.js', 'src/js/thirdParty/lodash.js', 'src/js/inject/youTubeInject.js'],
		            'dist/js/inject/youTubeIFrameInject.js': ['src/js/thirdParty/jquery.js', 'src/js/thirdParty/lodash.js', 'src/js/inject/youTubeIFrameInject.js']
		        }
		    }
		},

		useminPrepare: {
		    //  Target src here so CSS can still be found.
            //  TODO: Options, Fullscreen
		    html: 'src/foreground.html'
		},

		usemin: {
		    html: 'dist/foreground.html'
		},
	
		watch: {
			files: ['<%= jshint.files %>'],
			tasks: ['jshint']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
    //  Bulky, install on-demand only.
    //grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-usemin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-template-jasmine-requirejs');
	grunt.loadNpmTasks('grunt-text-replace');

	grunt.registerTask('default', ['connect jasmine watch']);
	grunt.registerTask('test', ['connect', 'jasmine']);
    //  TODO: enable htmlmin once I figure out why my templates aren't being parsed.
	grunt.registerTask('production', ['requirejs', 'uglify', 'dist-manifest-transform', 'update-require-config-paths', 'useminPrepare', 'usemin', 'concat', 'cssmin']);
	//grunt.registerTask('production', ['requirejs']);
	grunt.registerTask('lint', ['jshint']);

	//	Generate a versioned zip file after transforming relevant files to production-ready versions.
	grunt.registerTask('dist', 'Cleanup the extension and zip it up.', function (version) {

		//	Update version number in manifest.json:
		if (version === undefined) {
			grunt.warn('dist must be called with a version. e.g.: dist:0.98');
			return;
		}

		grunt.option('version', version);

		grunt.task.run('dist-update-manifest-version', 'dist-remove-old-folder', 'dist-copy-source', 'dist-remove-undeployable-files', 'dist-manifest-transform', 'dist-transform-settings', 'dist-compress');
	});

	//	Update the manifest file's version number first -- new version is being distributed and it is good to keep files all in sync.
	grunt.registerTask('dist-update-manifest-version', 'updates the manifest version to the to-be latest distributed version', function () {
		grunt.config.set('replace', {
			updateManifestVersion: {
				src: ['app/manifest.json'],
				overwrite: true,
				replacements: [{
					from: /"version": "\d{0,3}.\d{0,3}"/,
					to: '"version": "' + grunt.option('version') + '"'
				}]
			}
		});
		grunt.task.run('replace');
	});

	//	Cleanup any old dist folder to ensure only the files we want are put into the current release.
	//grunt.registerTask('dist-remove-old-folder', 'removes any previously existing dist folder', function () {
	//	if (grunt.file.exists('dist')) {
	//		//	Can't delete a full directory -- clean it up.
	//		grunt.config.set('clean', ['dist']);
	//		grunt.task.run('clean');
	//		grunt.file.delete('dist');
	//	}
	//});

	//	Copy everything before transforming to not affect the originals.
	grunt.registerTask('dist-copy-source', 'copy all the needed files to the dist directory', function () {

		grunt.config.set('copy', {
			copyExtension: {
				expand: true,
				src: 'app/**',
				dest: 'dist'
			}
		});
		grunt.task.run('copy');

	});
	
	grunt.registerTask('dist-remove-undeployable-files', 'removes any files that should not be deployed', function () {
		grunt.file.delete('dist/app/js/thirdParty/chrome-api-vsdoc.js');
		grunt.file.delete('dist/app/js/thirdParty/jasmine.js');
		grunt.file.delete('dist/app/js/thirdParty/jasmine-html.js');
	});

    //  TODO: This is probably bad practice.
	grunt.registerTask('update-require-config-paths', 'changes the paths for require config so they work for deployment', function () {

	    grunt.config.set('replace', {
	        removeDebuggingKeys: {
	            src: ['dist/js/background/main.js', 'dist/js/foreground/main.js'],
	            overwrite: true,
	            replacements: [{
	                //  Change all main files paths to requireConfig for to be accurate for deployment.
	                from: '../requireConfig',
	                to: 'requireConfig'
	            }]
	        }
	    });

	    grunt.task.run('replace');
	});

	//	Remove debugging information from the manifest file
	grunt.registerTask('dist-manifest-transform', 'removes debugging info from the manifest.json', function () {

		grunt.config.set('replace', {
			removeDebuggingKeys: {
				src: ['dist/manifest.json'],
				overwrite: true,
				replacements: [{
					//	Remove manifest key -- can't upload to Chrome Web Store if this entry exists in manifest.json, but helps with debugging.
					from: /"key".*/,
					to: ''
				}, {
					//	Remove permissions that're only needed for debugging.
					from: '"http://localhost:61975/Streamus/",',
					to: ''
				}, {
				    //  Transform inject javascript to reference uglified/concat versions for deployment.
				    from: '"js": ["js/thirdParty/lodash.js", "js/thirdParty/jquery.js", "js/inject/youTubeIFrameInject.js"]',
				    to: '"js": ["js/inject/youTubeIFrameInject.js"]'
				}, {
				    //  Transform inject javascript to reference uglified/concat versions for deployment.
				    from: '"js": ["js/thirdParty/lodash.js", "js/thirdParty/jquery.js", "js/inject/youTubeInject.js"]',
				    to: '"js": ["js/inject/youTubeInject.js"]'
				}, {
				    //  Transform inject javascript to reference uglified/concat versions for deployment.
				    from: '"js": ["js/thirdParty/lodash.js", "js/thirdParty/jquery.js", "js/inject/streamusShareInject.js"]',
				    to: '"js": ["js/inject/streamusShareInject.js"]'
				}, {
				    //  Transform inject javascript to reference uglified/concat versions for deployment.
				    from: '"js": ["js/thirdParty/lodash.js", "js/thirdParty/jquery.js", "js/inject/streamusInject.js"]',
				    to: '"js": ["js/inject/streamusInject.js"]'
				}, {
				    //  Transform inject javascript to reference uglified/concat versions for deployment.
				    from: '"js": ["js/thirdParty/jquery.js", "js/thirdParty/bootstrap.min.js", "js/inject/beatportInject.js"]',
				    to: '"js": ["js/inject/beatportInject.js"]'
				}]
			}
		});

		grunt.task.run('replace');
	});

	//	Remove debugging information from the JavaScript
	grunt.registerTask('dist-transform-settings', 'ensure all the debugging flags are turned off in settings', function () {

		grunt.config.set('replace', {
			transformSettings: {
				src: ['dist/app/js/background/model/settings.js'],
				overwrite: true,
				replacements: [{
					//	Find the line that looks like: "localDebug: true" and set it to false. Local debugging is for development only.
					from: 'localDebug: true',
					to: 'localDebug: false'
				}, {
					//	Find the line that looks like: "testing: true" and set it to false. Testing is for development only.
					from: 'testing: true',
					to: 'testing: false'
				}]
			}
		});

		grunt.task.run('replace');

	});

	//	Zip up the dist folder
	grunt.registerTask('dist-compress', 'compress the files which are ready to be uploaded to the Chrome Web Store into a .zip', function () {
	
		var zipFileName = 'Streamus v' + grunt.option('version') + '.zip';

		//	Remove old version if it exists
		if (grunt.file.exists(zipFileName)) {
			grunt.file.delete(zipFileName);
		}

		grunt.config.set('compress', {
			dist: {

				options: {
					archive: zipFileName
				},
				files: [{
					src: ['dist/app/**'],
					dest: 'streamus/'
				}]

			}
		});

		grunt.task.run('compress');
		
	});

};