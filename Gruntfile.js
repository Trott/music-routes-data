/* global module:false */
module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    exec: {
      test: {
        cmd: 'npx jasmine spec/*.js'
      }
    },

    jasmine_node: {
      options: {
        forceExit: true
      }
    }
  })

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-exec')

  // Default task.
  grunt.registerTask('default', ['exec:test'])
}
