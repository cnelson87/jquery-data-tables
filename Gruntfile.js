
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
		portNum : '<%= pkg.portNumber %>',

		// File Paths
		basePath : '.',
		sourcePath		: '<%= basePath %>/src',
		sourceHTML		: '<%= sourcePath %>/html',
		sourceIncludes	: '<%= sourceHTML %>/_includes',
		sourceScripts	: '<%= sourcePath %>/scripts',
		sourceStyles	: '<%= sourcePath %>/styles',
		sourceTemplates	: '<%= sourcePath %>/templates',
		sourceImages	: '<%= sourcePath %>/images',
		sourceVendor	: '<%= sourceScripts %>/vendor',
		sitePath		: '<%= basePath %>/public',
		outputAssets	: '<%= sitePath %>/_ui',
		outputScripts	: '<%= outputAssets %>/js',
		outputStyles	: '<%= outputAssets %>/css',
		outputVendor	: '<%= outputScripts %>/lib',
		outputImages	: '<%= outputAssets %>/img',


		// Run web server
		'connect': {
			dev: {
				options: {
					hostname: null,
					port: '<%= portNum %>',
					base: '<%= sitePath %>/'
				}
			}
		},

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

		// Concatenates script files into a single file
		'concat': {
			options: {
				//separator: '\n;\n'
				separator: '\n'
			},
			vendor: {
				src: [
					'<%= sourceVendor %>/modernizr.custom.min.js',
					'<%= sourceVendor %>/json2.js',
					'<%= sourceVendor %>/jquery-1.10.2.min.js',
					'<%= sourceVendor %>/jquery.dataTables-1.10.0-dev.js',
					'<%= sourceVendor %>/jquery.dataTables.ColumnFilter.js',
					'<%= sourceVendor %>/jquery.dataTables.titleNumeric.js',
					'<%= sourceVendor %>/jquery.dataTables.fnFilterClear.js',
					'<%= sourceVendor %>/class.js'
				],
				dest: '<%= outputVendor %>/vendor.js'
			}
		},

		// Compile sass to css
		'sass': {
			compile: {
				options: {
					//style: 'expanded',
					style: 'compact',
					debug: false
				},
				files: [{
					src: '<%= sourceStyles %>/styles.scss',
					dest: '<%= outputStyles %>/<%= fileName %>.css'
				}]
			}
		},

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
