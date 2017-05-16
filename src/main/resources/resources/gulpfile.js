var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('default', function() {
  return "a";
});

gulp.task('concat', function() {
  return gulp.src('./src/js/**')
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./dist/js'));
});

gulp.watch('./src/js/**', ['concat']);
