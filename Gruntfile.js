module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
 
    watch: {
        files: ['tests/*.js', 'tests/*.html'],
        tasks: ['qunit']
    },
    qunit: {
        all: ['tests/*.html']
    },
    uglify: {
        my_target: {
            files: {
                'release/bslider-1.0.min.js' : ['bslider-1.0.js']    
            }
        }
    },
    jshint: {
        options: {
            curly: true,
            eqeqeq: true,
            eqnull: true,
            browser: true,
            globals: {
                jQuery: true
            }
        },
        all: ['*.js']
    }
  });
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.registerTask('test', ['jshint:all', 'qunit']);
  grunt.registerTask('default', ['jshint:all', 'qunit', 'uglify']);
};
