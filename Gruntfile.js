module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);
    
	grunt.initConfig({

		// Import package manifest
		pkg: grunt.file.readJSON("jquery.json"),

		// Banner definitions
		meta: {
			banner: "/*\n" +
				" *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n" +
				" *  <%= pkg.description %>\n" +
				" *  <%= pkg.homepage %>\n" +
				" *\n" +
				" *  Made by <%= pkg.author.name %>\n" +
				" *  Under <%= pkg.licenses[0].type %> License\n" +
				" */\n"
		},

		// Concat definitions
		concat: {
			dist: {
				src: ["src/jquery.wquerybuilder.js"],
				dest: "dist/jquery.wquerybuilder.js"
			},
			options: {
				banner: "<%= meta.banner %>"
			}
		},

		// Lint definitions
		jshint: {
			files: ["src/jquery.wquerybuilder.js"],
			options: {
				jshintrc: ".jshintrc"
			}
		},

		// Minify definitions
		uglify: {
			my_target: {
				src: ["dist/jquery.wquerybuilder.js"],
				dest: "dist/jquery.wquerybuilder.min.js"
			},
			options: {
				banner: "<%= meta.banner %>"
			}
		},
        
        less: {
            main: {
                files: {
                    "dist/jquery.wquerybuilder.css": "less/jquery.wquerybuilder.less"
                }
            }
        },
        
        cssmin: {
            minify: {
                expand: true,
                cwd: 'dist/',
                src: ['*.css', '!*.min.css'],
                dest: 'dist/',
                ext: '.wquerybuilder.min.css'
            }
        },
        
        // Copy files
        copy: {
            main: {
                src: "src/libs/**",
                dest: "dist/",
                flatten: true,
                expand: true,
                filter: 'isFile'
            }
        },
        
        'testem': {
            options : {
                launch_in_ci : [
                    'chrome'
                ]
            },
            main : {
                src: [ 'SpecRunner.html' ]
            }
        }

	});

	grunt.registerTask("default", ["jshint", "concat", "uglify", "copy:main", "less:main", "cssmin:minify"]);
};
