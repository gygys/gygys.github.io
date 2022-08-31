/*
 * grunt-check-gems
 * https://github.com/thoras/grunt-check-gems
 *
 * Copyright (c) 2014 TR
 * Licensed under the MIT license.
 */

'use strict';

var shell = require('shelljs');
var path = require('path');

module.exports = function(grunt) {

  var src;
  var gemfile;
  var result;

  grunt.registerMultiTask('check-gems', 'Grunt plugin for checking that all gem dependencies for Ruby specified in Gemfiles are installed and up-to-date.', function() {

    var options = this.options({
      'gemfile': 'Gemfile'
    });

    if (!shell.which('bundle')) {
      grunt.fatal('It seems that bundler isn\'t installed. Head over to http://bundler.io/ to install Bundler.');
    }

    this.files.forEach(function(file) {

      src = file.src.filter(function(filepath) {
        gemfile = filepath + '/' + options.gemfile;
        if (!(grunt.file.isDir(filepath) && grunt.file.exists(gemfile))) {
          grunt.warn('Gemfile "' + gemfile + '" not found.');
          return false;
        } else {
          return true;
        }
      });

      if (!src.length) {
        grunt.warn('No Gemfiles were found.');
      }

      src.forEach(function(filepath) {

        gemfile = path.join(
          grunt.file.isPathAbsolute(filepath) ? filepath : path.join(process.cwd(), filepath),
          options.gemfile
        );

        result = shell.exec('bundle check --gemfile=' + gemfile, {
          silent: true
        });

        if (result.code !== 0) {
          grunt.fatal('Can\'t satisfy your dependencies in "' + gemfile + '". Please head over there and install missing gems with `bundle install`.');
        }

      });

      grunt.log.ok('All Gemfile dependencies are satisfied.');

    });
  });

};
