
 module.exports = function(grunt) {

	var handleify = require('handleify');
	var path = require('path');
	var root = path.normalize(__dirname+"/..");

	// Project configuration.
	grunt.initConfig({

		// Metadata
		pkg: grunt.file.readJSON('package.json'),
		fileName: '<%= pkg.shortName %>',
		metaTitle: '<%= pkg.title %>',
		portNum : 3222,

		// File Paths
		basePath : '.',
		sourcePath		: '<%= basePath %>/src',
		sourceHTML		: '<%= sourcePath %>/html',
		sourceIncludes	: '<%= sourceHTML %>/_includes',
		sourceScripts	: '<%= sourcePath %>/scripts',
		sourceStyles	: '<%= sourcePath %>/styles',
		sourceTemplates	: '<%= sourcePath %>/templates',
		sourceVendor	: '<%= sourceScripts %>/vendor',
		sitePath		: '<%= basePath %>/public',
		outputScripts	: '<%= sitePath %>/_ui/js',
		outputStyles	: '<%= sitePath %>/_ui/css',
		outputVendor	: '<%= outputScripts %>/lib',


		// Compile javascript modules
		'browserify2': {
			compile: {
				entry: '<%= sourceScripts %>/initialize.js',
				//compile: '<%= sourceScripts %>/combined.js',
				compile: '<%= outputScripts %>/<%= fileName %>.js',
				// Precompile Handlebars templates
				beforeHook: function(bundle) {
					bundle.transform(handleify);
				},
				debug: true
			}
		},

		// Build static HTML pages with includes
		'includereplace': {
			dist: {
				options: {
					globals: {
						"meta-title": "<%= metaTitle %>",
						"file-name": "<%= fileName %>"
					},
					includesDir: '<%= sourceIncludes %>'
				},
				files: [{
					src: ['**/*.html', '!_includes/*.html'],
					dest: '<%= sitePath %>/',
					expand: true,
					cwd: '<%= sourceHTML %>/'
				}]
			}
		},

		'concat': {
			vendor: {
				options: {
					//separator: '\n;\n'
					separator: '\n'
				},
				src: [
					'<%= sourceVendor %>/modernizr.custom.min.js',
					'<%= sourceVendor %>/jquery-1.10.2.min.js',
					'<%= sourceVendor %>/jquery.dataTables-1.10.0-dev.js',
					'<%= sourceVendor %>/jquery.dataTables.ColumnFilter.js',
					'<%= sourceVendor %>/jquery.dataTables.fnFilterClear.js'
				],
				dest: '<%= outputVendor %>/vendor.js'
			}//,
			// scripts: {
			// 	options: {
			// 		//separator: '\n;\n'
			// 		separator: '\n'
			// 	},
			// 	src: [
			// 		// '<%= sourceScripts %>/Config.js',
			// 		// '<%= sourceScripts %>/Utils.js',
			// 		// '<%= sourceScripts %>/Main.js',
			// 		// '<%= sourceScripts %>/init.js'
			// 	],
			// 	dest: '<%= outputScripts %>/<%= fileName %>.js'
			// }
		},

		'connect': {
			dev: {
				options: {
					hostname: null,
					port: '<%= portNum %>',
					base: '<%= sitePath %>/'
				}
			}
		},

		// Pre-compile handlebars templates
		// 'handlebars': {
		// 	compile: {
		// 		options: {
		// 			namespace: 'BBBG.Templates',
		// 			templateRoot: 'BBBG.'
		// 		},
		// 		files: {
		// 			'<%= sourceScripts %>/Templates.js': '<%= sourceTemplates %>/**/*.hbs'
		// 		}
		// 	}
		// },

		// Compile sass to css
		'sass': {
			compile: {
				options: {
					style: 'expanded',
					debug: false
				},
				files: [{
					src: '<%= sourceStyles %>/styles.scss',
					dest: '<%= outputStyles %>/<%= fileName %>.css'
				}]
			}
		},

		// Compress and minify scripts
		// 'uglify': {
		// 	vendor: {
		// 		files: {
		// 		  '<%= outputVendor %>/vendor.min.js' : '<%= outputVendor %>/vendor.js'
		// 		}
		// 	}
		// },

		// Watch files for changes
		'watch': {
			options: {
				livereload: true
			},
			html: {
				files: '<%= sourceHTML %>/**/*.html',
				tasks: ['includereplace']
			},
			scripts: {
				files: '<%= sourceScripts %>/**/*.js',
				tasks: ['browserify2']
			},
			styles: {
				files: '<%= sourceStyles %>/**/*.*',
				tasks: ['sass']
			},
			templates: {
				files: '<%= sourceTemplates %>/**/*.hbs',
				tasks: ['browserify2']
			}
		}

	});
	// end Grunt task config

	// Load task dependencies
	require('load-grunt-tasks')(grunt);

	// Register custom tasks
	grunt.registerTask('build', ['includereplace', 'browserify2', 'concat', 'sass']);
	grunt.registerTask('run', ['build', 'connect', 'watch']);

};
