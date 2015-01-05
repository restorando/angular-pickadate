/* jshint strict: false, node: true */

var gulp = require('gulp');
var sass = require('gulp-sass');
var _ = require('lodash');
var karma = require('karma').server;
var karmaConf = require('./karma.conf');
var jshint = require('gulp-jshint');

var karmaConfFor = function(version) {
  var conf = _.clone(karmaConf);
  conf.files = _.clone(karmaConf.files);
  conf.files.unshift('test/lib/angular-*' + version + '.js');
  return conf;
};

gulp.task('sass', function () {
  gulp.src('./src/*.scss')
    .pipe(sass({ errLogToConsole: true }))
    .pipe(gulp.dest('./lib'));
});

gulp.task('lint', function() {
  return gulp.src('./**/*pickadate*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('test:legacy', function (done) {
  karma.start(_.assign({}, karmaConfFor('1.2.21'), {singleRun: true}), done);
});

/**
 * Run test once and exit
 */
gulp.task('test', ['lint', 'test:legacy'], function (done) {
  karma.start(_.assign({}, karmaConfFor('1.3.6'), {singleRun: true}), done);
});

/**
 * Watch for file changes and re-run tests on each change
 */

gulp.task('tdd:legacy', function (done) {
  karma.start(karmaConfFor('1.2.21'), done);
});

gulp.task('tdd', function (done) {
  karma.start(karmaConfFor('1.3.6'), done);
});

gulp.task('default', ['tdd']);
