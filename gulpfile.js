var gulp = require('gulp');
var concat = require('gulp-concat');
var gls = require('gulp-live-server');
var jshint = require('gulp-jshint');
var karmaServer = require('karma').Server;
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

/*  gulp test
 *    Runs test once then exits.
 */
gulp.task('test', function(done) {
  new karmaServer({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

/*
 *  gulp lint
 *    Lints non-vendor, non-minified .js files.
 */
gulp.task('lint', function() {
  return gulp.src([
    'gulpfile.js',
    'src/**/*.js',
    '!**/vendor/**/*.js',
    '!**/*.min.js'
  ])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

/*
 *  gulp bundle:js
 *    Concatenates and minifies all .js files in the src/client/app directory.
 *    Outputs the file app.min.js to the src/client directory.
 */
gulp.task('bundle:js', function() {
  // Ensure modules are concatenated first.
  gulp.src([
    'src/client/app/app.module.js',
    'src/client/app/**/*.module.js',
    'src/client/app/**/*.js',
    '!src/client/app/**/*.spec.js'
  ])
    // Remember to remove sourcemaps in production build.
    .pipe(sourcemaps.init())
      .pipe(concat('app.min.js'))
      // Include gulp-ng-annotate if dependency injection isn't being performed using array syntax.
      .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('src/client'));
});

/*
 *  gulp
 *    Lints and bundles javascript.
 *    Starts the server.
 *    Livereloads changes to .css and .html files.
 *    Rebundles changes to relevant.js files.
 *    Relints changes to .js files.
 */
gulp.task('default', ['bundle:js', 'lint'], function() {
  // Start server.js on its port (3000) and start the livereload server on port 35729.
  var server = gls('src/server/server.js', undefined, 35729);
  server.start();

  // Live reload .html and .css file changes.
  gulp.watch([
    'src/client/**/*.css',
    'src/client/**/*.html'
  ], function (file) {
    server.notify.apply(server, [file]);
  });

  // Rerun gulp lint when any non-vendor, non-minified .js files change.
  gulp.watch([
    'gulpfile.js',
    'src/**/*.js',
    '!**/vendor/**/*.js',
    '!**/*.min.js'
  ], ['lint']);

  // Restart server on server.js changes.
  gulp.watch('src/server/server.js', function() {
    server.start.bind(server)();
  });

  // Rerun gulp bundle:js when bundled .js files change.
  gulp.watch([
    'src/client/app/**/*.js',
    '!src/client/app/**/*.spec.js'
  ], ['bundle:js']);
});
