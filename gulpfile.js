/* jshint strict: false, node: true */

var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var del = require("del");
var _ = require('lodash');
var karma = require('karma').server;
var karmaConf = require('./karma.conf');
var jshint = require('gulp-jshint');
var legacyVersions = ['1.2.21', '1.3.6'];

var karmaConfFor = function(version) {
  var conf = _.clone(karmaConf);
  conf.files = _.clone(karmaConf.files);
  conf.files.unshift('test/lib/angular-*' + version + '.js');
  return conf;
};

gulp.task('clean', function(done) {
  del('dist/*', done);
});

gulp.task('dist', ['uglify', 'sass'], function() {
  return gulp.src('./src/*.js')
    .pipe(gulp.dest('./dist'));
});

gulp.task('uglify', function() {
  gulp.src('./src/*.js')
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./dist'));
});

gulp.task('sass', function () {
  gulp.src('./src/*.scss')
    .pipe(sass({ errLogToConsole: true }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('lint', function() {
  return gulp.src('./src/angular-pickadate.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

legacyVersions.forEach(function(version) {
  gulp.task('test:legacy:' + version, function (done) {
    karma.start(_.assign({}, karmaConfFor(version), {singleRun: true}), done);
  });

  gulp.task('tdd:legacy:' + version, function (done) {
    karma.start(karmaConfFor(version), done);
  });
});

gulp.task('test:legacy', legacyVersions.map(function(version) {
  return 'test:legacy:' + version;
}));

/**
 * Run test once and exit
 */
gulp.task('test', ['lint', 'test:legacy'], function (done) {
  karma.start(_.assign({}, karmaConfFor('1.4.0'), {singleRun: true}), done);
});


gulp.task('tdd', function (done) {
  karma.start(karmaConfFor('1.4.0'), done);
});

gulp.task('default', ['tdd']);
