/*jslint node: true*/
//	Provides methods which may be executed from the command prompt by being in this files cwd.
//	Type grunt to run the default method, or "grunt paramater" to run a specific method.
//
//	Options:
//      *   grunt deploy: Pass a version to creat dist .zip. Otherwise, test production without updating manifest version or creating a .zip/linting, just walk through normal steps.
//
//	See here for more information: http://gruntjs.com/sample-gruntfile
'use strict';

module.exports = function (grunt) {
	grunt.initConfig({
		//	Read project settings from package.json in order to be able to reference the properties with grunt.
		pkg: grunt.file.readJSON('package.json'),
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

				//	Don't validate third-party libraries
				ignores: ['src/js/thirdParty/**/*.js']
			}
		},
		less: {
			files: {
				expand: true,
				ieCompat: false,
				cwd: 'src/less/',
				src: 'foreground.less',
				dest: 'dist/css',
				ext: '.css'
			}
		},
		recess: {
		    dist: {
		        src: 'src/less/foreground.less',
		        options: {
		            //  TODO: Remove these hopefully
		            noUniversalSelectors: false,
		            strictPropertyOrder: false
		        }
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
					fileExclusionRegExp: /^\.|vsdoc.js$|.css$/
				}

			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-recess');

    var _ = require('lodash');

	//	Generate a versioned zip file after transforming relevant files to production-ready versions.
	grunt.registerTask('deploy', 'Transform and copy extension to /dist folder and generate a dist-ready .zip file. If no version passed, just test', function (version) {
		var isDebugDeploy = version === undefined;
		grunt.config.set('isDebugDeploy', isDebugDeploy);

		//	Update version number in manifest.json:
		if (isDebugDeploy) {
			grunt.log.write('NOTICE: version is undefined, running as debug deploy and not production. To run as production, pass version. e.g.: deploy:0.98');
		} else {
			grunt.option('version', version);
		}

		//  Ensure lint validation passes first and foremost. Clean code is important.
		grunt.task.run('jshint');
	    //  Make sure our _locales aren't out of date.
	    grunt.task.run('diffLocales');
		
		//  It's necessary to run requireJS first because it will overwrite manifest-transform.
		grunt.task.run('requirejs');
		
		if (!isDebugDeploy) {
			//  Leave the debug key in for testing, but it has to be removed for deployment to the web store
			grunt.task.run('remove-key-from-manifest');
		}

		grunt.task.run('manifest-transform', 'disable-localDebug', 'concat-injected-javascript', 'copy-injected-css', 'less', 'update-css-references', 'imagemin', 'update-require-config-paths', 'cleanup-dist-folder');
		
		//  Spit out a zip and update manifest file version if not a test.
		if (!isDebugDeploy) {
			//  Update the version of Streamus since we're actually deploying it and not just testing Grunt.
			grunt.task.run('update-dist-manifest-version');
			grunt.task.run('prep-chrome-distribution');
			grunt.task.run('prep-opera-distribution');
			grunt.task.run('update-src-manifest-version');
		}
	});
	
	//	Update the manifest file's version number -- new version is being distributed and it is good to keep files all in sync.
	grunt.registerTask('update-dist-manifest-version', 'updates the manifest version to the to-be latest distributed version', function () {
		grunt.config.set('replace', {
			updateManifestVersion: {
				src: ['dist/manifest.json'],
				overwrite: true,
				replacements: [{
					from: /"version": "\d{0,3}.\d{0,3}"/,
					to: '"version": "' + grunt.option('version') + '"'
				}]
			}
		});
		
		grunt.task.run('replace');
	});
	
	//	Update the manifest file's version number -- new version is being distributed and it is good to keep files all in sync.
	grunt.registerTask('update-src-manifest-version', 'updates the manifest version to the to-be latest distributed version', function () {
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

	grunt.registerTask('concat-injected-javascript', 'injected javascript files don\'t use requireJS so they have to be manually concatted', function () {
		grunt.config.set('concat', {
			inject: {
				files: {
					'dist/js/inject/beatportInject.js': ['src/js/thirdParty/jquery.js', 'src/js/inject/beatportInject.js'],
					'dist/js/inject/streamusInject.js': ['src/js/thirdParty/jquery.js', 'src/js/thirdParty/lodash.js', 'src/js/inject/streamusInject.js'],
					'dist/js/inject/streamusShareInject.js': ['src/js/thirdParty/jquery.js', 'src/js/thirdParty/lodash.js', 'src/js/inject/streamusShareInject.js'],
					'dist/js/inject/youTubeInject.js': ['src/js/thirdParty/jquery.js', 'src/js/thirdParty/lodash.js', 'src/js/inject/youTubeInject.js'],
					'dist/js/inject/youTubeIFrameInject.js': ['src/js/thirdParty/jquery.js', 'src/js/thirdParty/lodash.js', 'src/js/inject/youTubeIFrameInject.js']
				}
			}
		});
		
		grunt.task.run('concat');
	});
	
	grunt.registerTask('copy-injected-css', 'copies injected css from src to dist folder', function () {
		grunt.config.set('copy', {
			inject: {
				files: {
					'dist/css/beatportInject.css': ['src/css/beatportInject.css']
				}
			}
		});

		grunt.task.run('copy');
	});

	grunt.registerTask('cleanup-dist-folder', 'removes the template folder since it was inlined into javascript and deletes build.txt', function () {
		if (grunt.file.exists('dist/template')) {
			//	Can't delete a full directory -- clean it up.
			grunt.config.set('clean', ['dist/template', 'dist/less']);
			grunt.task.run('clean');
			grunt.file.delete('dist/template');
			grunt.file.delete('dist/less');
			grunt.file.delete('dist/js/thirdParty/mocha.js');
			grunt.file.delete('dist/js/thirdParty/chai.js');
			grunt.file.delete('dist/js/thirdParty/sinon.js');
			grunt.file.delete('dist/js/test');
			grunt.file.delete('dist/test.html');
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

	grunt.registerTask('update-css-references', 'replace less reference in foreground with css', function() {
		grunt.config.set('replace', {
			replaceLessReferences: {
				src: ['dist/foreground.html'],
				overwrite: true,
				replacements: [{
					from: 'less/',
					to: 'css/'
				}, {
					from: '.less',
					to: '.css'
				}, {
					from: 'stylesheet/less',
					to: 'stylesheet'
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
		var isDebugDeploy = grunt.config.get('isDebugDeploy');
		var replacements = [];
		
		//  Don't remove this when testing debug deploy because server will throw CORS error
		if (!isDebugDeploy) {
			replacements.push({
				//	Remove permissions that're only needed for debugging.
				from: /".*localhost:.*,/g,
				to: ''
			});
		}

		grunt.config.set('replace', {
			removeDebuggingKeys: {
				src: ['dist/manifest.json'],
				overwrite: true,
				replacements: replacements.concat([{
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
					from: '"js": ["js/thirdParty/jquery.js", "js/inject/beatportInject.js"]',
					to: '"js": ["js/inject/beatportInject.js"]'
				}])
			}
		});

		grunt.task.run('replace');
	});

	//	Remove debugging information from the JavaScript
	grunt.registerTask('disable-localDebug', 'ensure debugging flag is turned off', function () {
		grunt.config.set('replace', {
			transformSettings: {
				src: ['dist/js/background/background.js'],
				overwrite: true,
				replacements: [{
					//	Find the line that looks like: "localDebug: true" and set it to false. Local debugging is for development only.
					from: 'localDebug: true',
					to: 'localDebug: false'
				}]
			}
		});

		grunt.task.run('replace');
	});

	//	Zip up the distribution folder and give it a build name. The folder can then be uploaded to the Chrome Web Store.
	grunt.registerTask('prep-chrome-distribution', 'compress the files which are ready to be uploaded to the Chrome Web Store into a .zip', function () {
		//  There's no need to cleanup any old version because this will overwrite if it exists.
		grunt.config.set('compress', {
			dist: {
				options: {
					archive: 'release/Streamus v' + grunt.option('version') + '/chrome/' + 'Streamus v' + grunt.option('version') + '.zip'
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

	grunt.registerTask('prep-opera-distribution', '', function() {
		//  Copy the distribution folder into opera directory.
		var operaDirectory = 'release/Streamus v' + grunt.option('version') + '/opera';

		grunt.config.set('copy', {
			files: {
				cwd: 'dist/',
				src: '**/*',
				dest: operaDirectory,
				expand: true
			}
		});

		grunt.task.run('copy');

		//  Remove background and notifications from manifest as they aren't available in opera yet.
		grunt.config.set('replace', {
			removeDebuggingKeys: {
				src: [operaDirectory + '/manifest.json'],
				overwrite: true,
				replacements: [{
					from: '"background",',
					to: ''
				}]
			}
		});

		grunt.task.run('replace');

		var operaLocalesDirectory = operaDirectory + '/_locales/';

		//  Delete all non-english translations for Opera because they have stricter translation policies I don't care about complying with.
	    //	Can't delete a full directory -- clean them up.
	    //  TODO: Make this more generic so I don't have to constantly update it.
		grunt.config.set('clean', [
			operaLocalesDirectory + 'de',
			operaLocalesDirectory + 'es',
			operaLocalesDirectory + 'fr',
			operaLocalesDirectory + 'nl',
		    operaLocalesDirectory + 'no',
		    operaLocalesDirectory + 'tr'
		]);
		grunt.task.run('clean');
		
		//  There's no need to cleanup any old version because this will overwrite if it exists.
		grunt.config.set('compress', {
			dist: {
				options: {
					archive: 'release/Streamus v' + grunt.option('version') + '/opera/' + 'Streamus v' + grunt.option('version') + '.zip'
				},
				files: [{
					src: ['**'],
					dest: '',
					cwd: operaDirectory,
					expand: true
				}]
			}
		});

		grunt.task.run('compress');
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
};