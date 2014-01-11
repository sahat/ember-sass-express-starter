var gulp = require('gulp');
var watch = require('gulp-watch');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var svgmin = require('gulp-svgmin');
var imagemin = require('gulp-imagemin');
var handlebars = require('gulp-handlebars');

gulp.task('sass', function() {
  gulp.src('app/stylesheets/*.scss')
    //.pipe(watch())
    .pipe(sass({ includePaths: ['app/stylesheets'] }))
    .pipe(gulp.dest('app/stylesheets'))
});

gulp.task('templates', function(){
  gulp.src(['app/javascripts/templates/*.hbs'])
    //.pipe(watch())
    .pipe(handlebars({
      namespace: 'App.templates',
      outputType: 'hybrid'
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('app/javascripts'));
});

//
gulp.task('scripts', function() {
  gulp.src('app/javascripts/**/*.js')
    .pipe(concat('combined.js'))
    .pipe(gulp.dest('dist/javscripts'));
});

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
  gulp.watch("./dev/sass/**/*.scss", function(event){
    gulp.run('sass');
  });
  gulp.watch("./dev/js/**/*.js", function(event){
    gulp.run('uglify');
  });
  gulp.watch("./dev/img/**/*", function(event){
    gulp.run('imagemin');
    gulp.run('svgmin');
  });
});
