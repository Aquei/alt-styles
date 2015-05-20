var gulp = require("gulp");
var uglify = require("gulp-uglify");

gulp.task("js", function(){
	gulp.src("dev/*.js")
		.pipe(uglify())
		.pipe(gulp.dest("dist"));
});

gulp.task("html", function(){
	gulp.src("dev/*.html")
		.pipe(gulp.dest("dist"));
});


gulp.task("default", ["js", "html"]);
