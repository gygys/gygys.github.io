# grunt-check-gems

> Grunt plugin for checking that all gem dependencies for Ruby specified in Gemfiles are installed and up-to-date.

## Getting Started

This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-check-gems --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-check-gems');
```

## The "check-gems" task

### Overview

In your project's Gruntfile, add a section named `check-gems` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  'check-gems': {
    options: {
      // Options go here.
    },
    your_target: {
      // Directory lists go here.
    },
  },
})
```

### Usage Examples

#### Default Options

In this example, the default option (`Gemfile` as name of your Gemfile) is used.

```js
grunt.initConfig({
  'check-gems': {
    test: {
      files: [{
        src: ['./', 'test']
      }]
    }
  }
})
```

#### Custom Options

In this example, a custom option (= a customized name of your Gemfile) is used.

```js
grunt.initConfig({
  check-gems: {
    options: {
      gemfile: 'YourWeirdGemfileName',
    },
    test: {
      files: [{
        src: ['./', 'test']
      }]
    }
  }
})
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## License

Copyright (c) 2014 TR. Licensed under the MIT license.
