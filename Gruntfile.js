//  A Gruntfile defines all of the configuration options necessary to run GruntJS against a given directory.
//  See here for more information: http://gruntjs.com/sample-gruntfile
'use strict';

module.exports = function (grunt) {

    grunt.initConfig({

        //  Read in the project settings from the package.json file into the pkg property. This allows us to refer to the values of properties within our package.json.
        pkg: grunt.file.readJSON('package.json'),

        //  Connect spins up tiny, quick servers for testing on
        connect: {
            test: {
                port: 8000
            }
        },

        //  Jasmine is for running our test cases. This runs in a headless web browser using phantom-js which is pretty sweet.
        jasmine: {
            //  Here's all the JavaScript I want to consider when running test cases
            src: 'app/js/*.js',
            options: {
                //  Specs are all the cases I want to run
                specs: 'test/js/spec/*Spec.js',
                //  Don't run under file:// because some APIs don't respond well to that
		        host: 'http://localhost:8000/',
			    template: require('grunt-template-jasmine-requirejs'),
			    templateOptions: {
			        requireConfigFile: 'test/js/main.js',
			        requireConfig: {
			            //  Override the base URL with one relative to the gruntfile.
			            baseUrl: 'app/js/',
			            //  Emulate main.js' initialization logic.
			            deps: ['settings', 'backbone', 'jquery','lodash'],
			            callback: function (Settings, Backbone, $, _) {
			                //  Enable testing in Settings so configuration values can be set accordingly (API keys, etc. testing runs on localhost)
			                Settings.set('testing', true);
			                //  Testing should hit a local server and not be ran against the production database.
			                Settings.set('localDebug', true);
			            }
			        }
			    }
		    }
	    },

        jshint: {
          files: ['Gruntfile.js', 'app/js/**/*.js', 'test/js/**/*.js'],
          options: {
            // options here to override JSHint defaults
            globals: {
              jQuery: true,
              console: true,
              module: true,
              document: true
            },
		    //  Don't validate third-party libraries.
		    ignores: ['app/js/thirdParty/**/*.js']
          }
        },
	
        watch: {
          files: ['<%= jshint.files %>'],
          tasks: ['jshint']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-template-jasmine-requirejs');
    grunt.loadNpmTasks('grunt-text-replace');

    grunt.registerTask('default', ['connect jasmine watch']);
    grunt.registerTask('test', ['connect', 'jasmine']);
    grunt.registerTask('lint', ['jshint']);

    //  Generate a versioned zip file after transforming relevant files to production-ready versions.
    grunt.registerTask('deploy', 'Cleanup the extension and zip it up.', function (version) {

        //  Update version number in manifest.json:
        if (version === undefined) {
            grunt.warn('Deploy must be called with a version. e.g.: deploy:0.98');
            return;
        }

        grunt.option('version', version);

        grunt.task.run(
                       'deploy-update-manifest-version',
                       'deploy-remove-old-folder',
                       'deploy-copy-source',
                       'deploy-manifest-transform',
                       'deploy-transform-settings',
                       'deploy-compress'
                       );
    });

    //  Update the manifest file's version number first -- new version is being deployed and it is good to keep files all in sync.
    grunt.registerTask('deploy-update-manifest-version', 'updates the manifest version to the to-be latest deployed version', function () {
        grunt.config.set('replace', {
            updateManifestVersion: {
                src: ['app/manifest.json'],
                overwrite: true,
                replacements: [{
                    from: /"version": "\d{0,2}.\d{0,2}"/,
                    to: '"version": "' + grunt.option('version') + '"'
                }]
            }
        });
        grunt.task.run('replace');
    });

    //  Cleanup any old deploy folder to ensure only the files we want are put into the current release.
    grunt.registerTask('deploy-remove-old-folder', 'removes any previously existing deploy folder', function () {
        if (grunt.file.exists('deploy')) {
            //  Can't delete a full directory -- clean it up.
            grunt.config.set('clean', ['deploy']);
            grunt.task.run('clean');
            grunt.file.delete('deploy');
        }
    });

    //  Copy everything before transforming to not affect the originals.
    grunt.registerTask('deploy-copy-source', 'copy all the needed files to the deploy directory', function () {

        grunt.config.set('copy', {
            copyExtension: {
                expand: true,
                src: 'app/**',
                dest: 'deploy'
            }
        });
        grunt.task.run('copy');

    });

    //  Remove debugging information from the manifest file
    grunt.registerTask('deploy-manifest-transform', 'removes debugging info from the manifest.json', function () {

        grunt.config.set('replace', {
            removeDebuggingKeys: {
                src: ['deploy/app/manifest.json'],
                overwrite: true,
                replacements: [{
                    //  Remove manifest key -- can't upload to Chrome Web Store if this entry exists in manifest.json, but helps with debugging.
                    from: /"key".*/,
                    to: ''
                }, {
                    //  Remove permissions that're only needed for debugging.
                    from: '"http://localhost:61975/Streamus/"',
                    to: ''
                }]
            }
        });

        grunt.task.run('replace');
    });

    //  Remove debugging information from the JavaScript
    grunt.registerTask('deploy-transform-settings', 'ensure all the debugging flags are turned off in settings', function () {

        grunt.config.set('replace', {
            transformSettings: {
                src: ['deploy/app/js/background/model/settings.js'],
                overwrite: true,
                replacements: [{
                    //  Find the line that looks like: "localDebug: true" and set it to false. Local debugging is for development only.
                    from: 'localDebug: true',
                    to: 'localDebug: false'
                }, {
                    //  Find the line that looks like: "testing: true" and set it to false. Testing is for development only.
                    from: 'testing: true',
                    to: 'testing: false'
                }]
            }
        });

        grunt.task.run('replace');

    });

    //  Zip it up
    grunt.registerTask('deploy-compress', 'compress the files which are ready to be deployed into a .zip', function () {

        var zipFileName = 'Streamus v' + grunt.option('version') + '.zip';

        if (grunt.file.exists(zipFileName)) {
            grunt.file.delete(zipFileName);
        }

        grunt.config.set('compress', {
            deploy: {

                options: {
                    archive: zipFileName
                },
                files: [{
                    src: ['deploy/app/**'],
                    dest: 'streamus/'
                }]

            }
        });

        grunt.task.run('compress');

    });

};