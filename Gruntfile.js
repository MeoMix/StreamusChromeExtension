/*jslint node: true*/
//	Provides methods which may be executed from the command prompt by being in this files cwd.
//	Type grunt to run the default method, or "grunt paramater" to run a specific method.
//
//	Options:
//		*	grunt: Start up a server, run Jasmine test cases, watch for changes.
//		*	grunt test: Start up a server, run Jasmine test cases.
//		*	grunt lint: Display linter errors about the project
//      *   grunt deploy: Pass a version to creat dist .zip. Otherwise, test production without updating manifest version or creating a .zip/linting, just walk through normal steps.
//
//	See here for more information: http://gruntjs.com/sample-gruntfile
'use strict';

module.exports = function (grunt) {

	grunt.initConfig({

		//	Read project settings from package.json in order to be able to reference the properties with grunt.
		pkg: grunt.file.readJSON('package.json'),

		//	Tasks:
		concat: {
			//  NOTE: Careful not to define separator as semi-colon here. It will error out on font-awesome CSS.
			options: {
				stripBanners: true
			}
		},
		
		cssmin: {
			dist: {
				files: {
					'dist/css/beatportInject.min.css': ['src/css/beatportInject.css', 'src/css/jquery.qtip.css'],
					'dist/css/youTubeInject.min.css': ['src/css/youTubeInject.css']
				}
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
				//  Don't minify template files becuase they can't be reliably parsed w/ javascript injected.
				src: ['**/*.html', '!**/template/**']
			}
		},

		//	Connect spins up tiny, quick servers for testing on
		connect: {
			test: {
				port: 8000
			}
		},

		//  Compress image sizes and move to dist folder
		imagemin: {

			dynamic: {
				files: [{
					expand: true,
					cwd: 'dist/img',
					src: ['**/*.{png,jpg,gif}'],
					dest: 'dist/img/'
				}]
			}

		},

		//	Jasmine is for running our test cases. This runs in a headless web browser using phantom-js which is pretty sweet.
		jasmine: {
			//	Here's all the JavaScript I want to consider when running test cases
			src: 'src/js/*.js',
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
						baseUrl: 'src/js/',
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
			files: ['Gruntfile.js', 'src/js/**/*.js', 'test/js/**/*.js'],
			
			options: {
				//	Override JSHint defaults for the extension
				globals: {
					jQuery: true,
					console: true
				},

				//  Don't whine about == on null vs undefined, it's a bit pedantic..
				"eqnull": true,

				//	Don't validate third-party libraries
				ignores: ['src/js/thirdParty/**/*.js']
			}
		},
		
		less: {
			files: {
				expand: true,
				cwd: 'src/less/',
				src: '*.less',
				dest: 'src/css',
				ext: '.css'
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
					mainConfigFile: 'src/js/common/requireConfig.js',
					//  List the modules that will be optimized. All their immediate and deep
					//  dependencies will be included in the module's file when the build is done
					modules: [{
						name: 'background/main',
						include: ['background/plugins']
					}, {
						name: 'background/background',
						exclude: ['background/main', 'background/plugins']
					}, {
						name: 'foreground/main',
						include: ['foreground/plugins']
					}, {
						name: 'foreground/foreground',
						exclude: ['foreground/main']
					}, {
						name: 'options/main',
						include: ['options/plugins']
					}, {
						name: 'options/options',
						exclude: ['options/main', 'options/plugins']
					}],
					optimize: 'uglify2',
					//  Skip CSS optimizations in RequireJS step -- handle with cssmin because it supports multiple CSS files.
					optimizeCss: 'none',
					preserveLicenseComments: false,
					//  Don't leave a copy of the file if it has been concatenated into a larger one.
					removeCombined: true,
					//  Skip files which start with a . or end in vs-doc.js as well as CSS because it is handled by cssmin
					fileExclusionRegExp: /^\.|vsdoc.js$|jasmine.js|jasmine-html.js|.css$|Web|Web.Debug|Web.Release/
				}

			}
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
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-template-jasmine-requirejs');
	grunt.loadNpmTasks('grunt-text-replace');

	grunt.registerTask('default', ['connect jasmine watch']);
	grunt.registerTask('test', ['connect', 'jasmine']);
	grunt.registerTask('lint', ['jshint']);

    //	Generate a versioned zip file after transforming relevant files to production-ready versions.
	grunt.registerTask('deploy', 'Transform and copy extension to /dist folder and generate a dist-ready .zip file. If no version passed, just test', function (version) {

	    //	Update version number in manifest.json:
	    if (version === undefined) {
	        grunt.log.write('NOTICE: version is undefined, running as debug deploy and not production. To run as production, pass version. e.g.: production:0.98');
	    } else {
	        grunt.option('version', version);
	    }

	    if (version !== undefined) {
	        //  Linting is a bit annoying for test. Just ensure lint validation passes for production.
	        grunt.task.run('lint');
	    }
	    
	    //  It's necessary to run requireJS first because it will overwrite manifest-transform.
	    grunt.task.run('requirejs');
	    
	    if (version !== undefined) {
	        //  Leave the debug key in for testing, but it has to be removed for deployment to the web store
	        grunt.task.run('remove-key-from-manifest');
	    }

	    grunt.task.run('manifest-transform', 'transform-settings', 'concat-uglify-injected-javascript', 'less', 'concat', 'concat-cssmin-injected-css', 'cssmin', 'htmlmin', 'remove-less-reference', 'imagemin', 'update-require-config-paths', 'transform-injected-js', 'cleanup-dist-folder');
	    
        //  Spit out a zip and update manifest file version if not a test.
        if (version !== undefined) {
            grunt.task.run('compress-extension', 'update-manifest-version');
        }

	});
    
	grunt.registerTask('concat-foreground-css', 'Takes all the relevant CSS files for the foreground and concats them into one file.', function () {
	    grunt.config.set('concat', {
	        dist: {
	            //  Don't want the inject files just foreground css files
	            src: ['src/css/*.css', '!src/css/*Inject.css'],
	            dest: 'dist/css/foreground.css'
	        }
	    });
	    grunt.task.run('concat');
	});
    
	//	Update the manifest file's version number first -- new version is being distributed and it is good to keep files all in sync.
	grunt.registerTask('update-manifest-version', 'updates the manifest version to the to-be latest distributed version', function () {
		grunt.config.set('replace', {
			updateManifestVersion: {
				src: ['src/manifest.json'],
				overwrite: true,
				replacements: [{
					from: /"version": "\d{0,3}.\d{0,3}"/,
					to: '"version": "' + grunt.option('version') + '"'
				}]
			}
		});
		grunt.task.run('replace');
	});

	grunt.registerTask('concat-cssmin-injected-css', 'injected css files load times matter so definitely uglify', function () {

	    grunt.config.set('cssmin', {
	        inject: {
	            files: {
	                'dist/css/beatportInject.min.css': ['src/css/beatportInject.css', 'src/css/jquery.qtip.css'],
	                'dist/css/youTubeInject.min.css': ['src/css/youTubeInject.css']
	            }
	        }
	    });

	    grunt.task.run('cssmin');
	});

	grunt.registerTask('concat-uglify-injected-javascript', 'injected javascript files don\'t use requireJS so they have to be manually concat/uglified', function () {

		grunt.config.set('uglify', {
			inject: {
				files: {
					'dist/js/inject/beatportInject.js': ['src/js/thirdParty/jquery.js', 'src/js/thirdParty/jquery.qtip.js', 'src/js/inject/beatportInject.js'],
					'dist/js/inject/streamusInject.js': ['src/js/thirdParty/jquery.js', 'src/js/thirdParty/lodash.js', 'src/js/inject/streamusInject.js'],
					'dist/js/inject/streamusShareInject.js': ['src/js/thirdParty/jquery.js', 'src/js/thirdParty/lodash.js', 'src/js/inject/streamusShareInject.js'],
					'dist/js/inject/youTubeInject.js': ['src/js/thirdParty/jquery.js', 'src/js/thirdParty/lodash.js', 'src/js/inject/youTubeInject.js'],
					'dist/js/inject/youTubeIFrameInject.js': ['src/js/thirdParty/jquery.js', 'src/js/thirdParty/lodash.js', 'src/js/inject/youTubeIFrameInject.js']
				}
			}
		});
		
		grunt.task.run('uglify');
	});

	grunt.registerTask('cleanup-dist-folder', 'removes the template folder since it was inlined into javascript and deletes build.txt', function () {
		if (grunt.file.exists('dist/template')) {
			//	Can't delete a full directory -- clean it up.
			grunt.config.set('clean', ['dist/template', 'dist/less']);
			grunt.task.run('clean');
			grunt.file.delete('dist/template');
			grunt.file.delete('dist/less');
		}

		grunt.file.delete('dist/build.txt');
	});

	grunt.registerTask('update-require-config-paths', 'changes the paths for require config so they work for deployment', function () {

		grunt.config.set('replace', {
			removeDebuggingKeys: {
				src: ['dist/js/**/main.js'],
				overwrite: true,
				replacements: [{
					//  Change all main files paths to requireConfig for to be accurate for deployment.
					from: '../common/requireConfig',
					to: 'common/requireConfig'
				}]
			}
		});

		grunt.task.run('replace');
	});

	grunt.registerTask('remove-less-reference', 'remove less reference in foreground', function() {
		grunt.config.set('replace', {
			removeDebuggingKeys: {
				src: ['dist/foreground.html'],
				overwrite: true,
				replacements: [{
					//  Change all main files paths to requireConfig for to be accurate for deployment.
					from: '<link href=less/foreground.less rel=stylesheet/less>',
					to: ''
				}]
			}
		});

		grunt.task.run('replace');
	});

	grunt.registerTask('remove-key-from-manifest', 'removes the key from manifest, separate because needed for testing deployment', function() {
		grunt.config.set('replace', {
			removeDebuggingKeys: {
				src: ['dist/manifest.json'],
				overwrite: true,
				replacements: [{
					//	Remove manifest key -- can't upload to Chrome Web Store if this entry exists in manifest.json, but helps with debugging.
					from: /"key".*/,
					to: ''
				}]
			}
		});

		grunt.task.run('replace');
	});

	//	Remove debugging information from the manifest file
	grunt.registerTask('manifest-transform', 'removes debugging info from the manifest.json', function () {

		grunt.config.set('replace', {
			removeDebuggingKeys: {
				src: ['dist/manifest.json'],
				overwrite: true,
				replacements: [{
					//	Remove permissions that're only needed for debugging.
					from: '"http://localhost:61975/Streamus/",',
					to: ''
				}, {
					//  Transform inject javascript to reference uglified/concat versions for deployment.
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
					from: '"js": ["js/thirdParty/jquery.js", "js/thirdParty/jquery.qtip.js", "js/inject/beatportInject.js"]',
					to: '"js": ["js/inject/beatportInject.js"]'
				}, {
					//  Transform inject css to reference uglified/concat versions for deployment.
					from: 'css/youTubeInject.css',
					to: 'css/youTubeInject.min.css'
				}, {
					from: 'css/beatportInject.css',
					to: 'css/beatportInject.min.css'
				}, {
					//  Remove jquery.qtip.css because it has been combined into beatportInject.min.css for deployment.
					from: '"css/jquery.qtip.css",',
					to: ''
				}]
			}
		});

		grunt.task.run('replace');
	});

	grunt.registerTask('transform-injected-js', 'transform inject files so that they reference minified versions of css', function() {

		grunt.config.set('replace', {
			transformSettings: {
				src: ['dist/js/inject/beatportInject.js', 'dist/js/inject/youTubeInject.js'],
				overwrite: true,
				replacements: [{
					//	Find the line that references beatportInject and change it to a minified reference.
					from: 'css/beatportInject.css',
					to: 'css/beatportInject.min.css'
				}, {
					//	Find the line that references youtubeInject and change it to a minified reference.
					from: 'css/youTubeInject.css',
					to: 'css/youTubeInject.min.css'
				}]
			}
		});

		grunt.task.run('replace');
	});

	//	Remove debugging information from the JavaScript
	grunt.registerTask('transform-settings', 'ensure all the debugging flags are turned off in settings', function () {

		grunt.config.set('replace', {
			transformSettings: {
				src: ['dist/js/background/model/settings.js'],
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

	//	Zip up the distribution folder and give it a build name. The folder can then be uploaded to the Chrome Web Store.
	grunt.registerTask('compress-extension', 'compress the files which are ready to be uploaded to the Chrome Web Store into a .zip', function () {

	    //  There's no need to cleanup any old version because this will overwrite if it exists.
		grunt.config.set('compress', {
			dist: {
				options: {
				    archive: 'Streamus v' + grunt.option('version') + '.zip'
				},
				files: [{
					src: ['**'],
					dest: '',
					cwd: 'dist/',
					expand: true
				}]
			}
		});

		grunt.task.run('compress');
	});

};