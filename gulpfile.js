var gulp = require('gulp'),
		less = require('gulp-less');
/* 编译less文件 */
gulp.task('compileLess', function () {
	gulp.src('src/less/*.less')
			.pipe(less())
			.pipe(gulp.dest('src/css'));
});
/* 监听less文件的变动 */
gulp.task('lessWatch', function () {
	gulp.watch('src/less/*.less', ['compileLess']);
});
gulp.task('default', ['compileLess', 'lessWatch']);