//  A Gruntfile defines all of the configuration options necessary to run GruntJS against a given directory.
//  See here for more information: http://gruntjs.com/sample-gruntfile
//  TODO: add devDependencies.
module.exports = function(grunt) {
	
	grunt.initConfig({
	
	//  Read in the project settings from the package.json file into the pkg property. This allows us to refer to the values of properties within our package.json.
    pkg: grunt.file.readJSON('package.json'),
	
	jasmine: {
		// src: 'js/**/*.js',
		options: {
			//  TODO: Probably rename my test to *spec to be consistent with their documentation.
			specs: 'js/test/*Test.js',
			template: require('grunt-template-jasmine-requirejs'),
			templateOptions: {
				requireConfig: {
					baseUrl: 'js/',
					shim: {

						'backbone': {
							//  These script dependencies should be loaded before loading backbone.js
							deps: ['lodash', 'jquery'],
							//  Once loaded, use the global 'Backbone' as the module value.
							exports: 'Backbone'
						},
						
						'googleApiClient': {
							exports: 'GoogleApiClient'
						},

						'jasmine-html': ['jasmine'],
						
						'lodash': {
							exports: '_'
						}

					}
				}
			}
		}
	},

    jshint: {
      files: ['Gruntfile.js', 'js/**/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        },
		//  Don't validate third-party libraries.
		ignores: ['js/thirdParty/**/*.js']
      }
    },
	
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
	
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-template-jasmine-requirejs');
  
  grunt.registerTask('test', ['jasmine']);
  
  grunt.registerTask('default', ['jshint']);

};