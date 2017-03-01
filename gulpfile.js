// Load required plugins
var gulp = require('gulp'),
    gulpif = require('gulp-if'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    runSequence  = require('run-sequence'),
    rev = require('gulp-rev'),
    include = require('gulp-include'),
    sourcemaps = require('gulp-sourcemaps')
    argv = require('minimist')(process.argv.slice(2)),
    isProduction = argv.production,
    concat = require('gulp-concat'),
    svgstore = require('gulp-svgstore'),
    svgmin = require('gulp-svgmin'),
    browserSync = require('browser-sync').create();

// Do the stuff!

// smash CSS!
gulp.task('styles', function() {
  return gulp.src([
      'public/assets/scss/application.scss',
    ])
    .pipe(gulpif(!isProduction, sourcemaps.init()))
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulpif(isProduction, cssnano()))
    .pipe(gulp.dest('public/assets/dist/css'))
    .pipe(gulpif(!isProduction, sourcemaps.write('maps')))
    .pipe(gulpif(!isProduction, gulp.dest('public/assets/dist/css')))
    .pipe(browserSync.stream({match: '**/*.css'}));
});

// smash javascript!
gulp.task('scripts', function() {
  return gulp.src([
      'public/assets/js/application.js',
    ])
    .pipe(include())
    .pipe(gulpif(!isProduction, sourcemaps.init()))
    .pipe(uglify())
    .pipe(gulp.dest('public/assets/dist/js'))
    .pipe(gulpif(!isProduction, sourcemaps.write('maps')))
    .pipe(gulpif(!isProduction, gulp.dest('public/assets/dist/js')))
    .pipe(browserSync.reload({stream:true}));
});

// revision files for production assets
gulp.task('rev', function() {
  return gulp.src(['public/assets/dist/**/*.css', 'public/assets/dist/**/*.js'])
    .pipe(rev())
    .pipe(gulp.dest('public/assets/dist'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('public/assets/dist'));
});

// SVG time!
gulp.task('svgs', function() {
  return gulp.src('public/assets/svgs/*.svg')
    .pipe(svgmin({
        plugins: [{
            removeViewBox: false
        }, {
            removeEmptyAttrs: false
        },{
            mergePaths: false
        }]
    }))
    .pipe(gulp.dest('public/assets/svgs'))
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(rename({suffix: '-defs'}))
    .pipe(gulp.dest('public/assets/svgs/build'))
    .pipe(browserSync.reload({stream:true}));
});

// `gulp clean` - Deletes the build folder entirely.
gulp.task('clean', require('del').bind(null, ['public/assets/dist']));

// `gulp build` - Run all the build tasks but don't clean up beforehand.
gulp.task('build', function(callback) {
  if (isProduction) {
    // production gulpin' (with file revisioning)
    runSequence(
      'clean',
      ['styles','scripts', 'svgs'],
      'rev',
      callback
    );
  } else {
    // dev gulpin'
    runSequence(
      'clean',
      ['styles','scripts', 'svgs'],
      callback
    );
  }
});

// Gulp watch
gulp.task('watch', ['build'], function() {
  // Init BrowserSync
  browserSync.init({
    files: ['*.html', '*.php'],
    proxy: 'ednavigator.dev',
    notify: false,
    open: false
  });

  gulp.watch('public/assets/scss/**/*.scss', ['styles']);
  gulp.watch('public/assets/js/**/*.js', ['scripts']);
  gulp.watch('public/assets/svgs/*.svg', ['svgs']);
});

// Make watch the default task
gulp.task('default', function() {
    gulp.start('build');
});