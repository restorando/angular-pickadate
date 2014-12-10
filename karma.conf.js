require('karma-chai-plugins');

// Karma configuration
// Generated on Sat Aug 09 2014 18:30:57 GMT-0300 (ART)

module.exports = {

  // base path that will be used to resolve all patterns (eg. files, exclude)
  basePath: '',


  // frameworks to use
  // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
  frameworks: ['mocha', 'chai', 'chai-jquery', 'sinon-chai'],


  // list of files / patterns to load in the browser
  files: [
    'test/lib/browser_trigger.js',
    'src/angular-pickadate.js',
    'node_modules/jquery/dist/jquery.js',
    'test/**/*.spec.js'
  ],


  // list of files to exclude
  exclude: [
  ],


  // preprocess matching files before serving them to the browser
  // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
  preprocessors: {
  },


  // test results reporter to use
  // possible values: 'dots', 'progress'
  // available reporters: https://npmjs.org/browse/keyword/karma-reporter
  reporters: ['progress'],


  // web server port
  port: 9876,


  // enable / disable colors in the output (reporters and logs)
  colors: true,

  // start these browsers
  // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
  browsers: ['PhantomJS'],

  plugins: [
    'karma-mocha',
    require('karma-phantomjs-launcher'),
    require('karma-chai-plugins')
  ]
};

