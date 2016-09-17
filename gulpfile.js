var gulp = require('gulp');
var server = require('gulp-express');

gulp.task('serve', function () {
  server.run(['index.js']);
  [gulp.watch(['index.js', '*.dot'], [server.run])]
})
