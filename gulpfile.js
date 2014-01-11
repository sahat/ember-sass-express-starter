// Gulp
var gulp = require('gulp');

// Stylesheets
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var minifycss = require('gulp-minify-css');

// JavaScript
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

// Images
var svgmin = require('gulp-svgmin');
var imagemin = require('gulp-imagemin');

// Templates
var handlebars = require('gulp-handlebars');

gulp.task('sass', function() {
  gulp.src('app/styles/*.scss')
    .pipe(sass({ includePaths: ['app/styles'] }))
    .pipe(gulp.dest('app/styles'))
});

gulp.task('templates', function(){
  gulp.src(['app/templates/*.hbs'])
    .pipe(handlebars({
      namespace: 'App.templates',
      outputType: 'hybrid'
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('build/js/'));
});

//
//gulp.task('scripts', function() {
//  // Minify and copy all JavaScript (except vendor scripts)
//  return gulp.src(['client/js/**/*.js', '!client/js/vendor/**'])
//    .pipe(uglify())
//    .pipe(gulp.dest('build/js'));
//});
//
//// Copy all static images
//gulp.task('images', function() {
// return gulp.src('client/img/**')
//    // Pass in options to the task
//    .pipe(imagemin({optimizationLevel: 5}))
//    .pipe(gulp.dest('build/img'));
//});
//
// The default task (called when you run `gulp`)
gulp.task('default', function() {
  gulp.run('sass', 'templates');

  // Watch files and run tasks if they change
  gulp.watch('client/js/**', function() {
    gulp.run('scripts');
  });

  gulp.watch('client/img/**', function() {
    gulp.run('images');
  });
});

gulp.task('deploy', function() {

  gulp.run('minify')

});