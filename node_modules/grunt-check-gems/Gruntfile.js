/*
 * grunt-check-gems
 * https://github.com/thoras/grunt-check-gems
 *
 * Copyright (c) 2014 TR
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    'check-gems': {
      test: {
        files: [{
          src: ['test']
        }]
      }
    }

  });

  grunt.loadTasks('tasks');
  grunt.registerTask('default', ['check-gems']);

};