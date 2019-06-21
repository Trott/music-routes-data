/* global module:false */
module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    // banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
    //   '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
    //   '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
    //   '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
    //   ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    // concat: {
    //   options: {
    //     banner: '<%= banner %>',
    //     stripBanners: true
    //   },
    //   dist: {
    //     src: ['lib/<%= pkg.name %>.js'],
    //     dest: 'dist/<%= pkg.name %>.js'
    //   }
    // },
    exec: {
      jslint: {
        cmd: 'npx semistandard'
      },
      verify: {
        cmd: 'node bin/verify'
      }
    },

    jasmine_node: {
      opetions: {
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
  // grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-jsonlint');

  // Default task.
  grunt.registerTask('default', ['jsonlint', 'exec:jslint', 'jasmine_node', 'exec:verify']);
};
