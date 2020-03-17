/* global module:false */
module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    exec: {
      test: {
        cmd: 'npx jasmine spec/*.js'
      },
      jslint: {
        cmd: 'npx semistandard'
      },
      verify: {
        cmd: 'node bin/verify'
      }
    },

    jasmine_node: {
      options: {
        forceExit: true
      }
    },

    jsonlint: {
      all: {
        src: ['package.json', 'spec/fixture/data/*', 'data/*']
      }
    }

  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-jsonlint');

  // Default task.
  grunt.registerTask('default', ['jsonlint', 'exec:jslint', 'exec:test', 'exec:verify']);
};
