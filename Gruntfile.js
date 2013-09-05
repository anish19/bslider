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
    }
  });
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['qunit']);
};
