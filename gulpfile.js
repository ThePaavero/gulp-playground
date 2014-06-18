
var gulp = require('gulp');

var fs = require('fs');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var sass = require('gulp-sass');
var cssmin = require('gulp-cssmin');
var prefix = require('gulp-autoprefixer');
var htmlmin = require('gulp-htmlmin');
var browserify = require('gulp-browserify');
var w3cjs = require('gulp-w3cjs');

var connect = require('gulp-connect');
var webshot=require('gulp-webshot');

var zip = require('gulp-zip');

var paths = {
	scripts: ['js/**/*.js'],
	images: 'img/**/*',
	scss: 'scss/**/*.scss',
	html: 'index.html'
};

gulp.task('scripts', function() {
	return gulp.src(paths.scripts)
	.pipe(browserify())
	.pipe(uglify())
	.pipe(concat('all.min.js'))
	.pipe(gulp.dest('build/js'));
});

gulp.task('images', function() {
 return gulp.src(paths.images)
	.pipe(imagemin({optimizationLevel: 5}))
	.pipe(gulp.dest('build/img'));
});

gulp.task('styles', function () {
	return gulp.src(paths.scss)
	.pipe(sass())
	.pipe(prefix("last 1 version", "> 1%", "ie 8", "ie 7"))
	.pipe(cssmin())
	.pipe(concat('all.min.css'))
	.pipe(gulp.dest('build/css'));
});

gulp.task('html', function () {
	return gulp.src(paths.html)
	// .pipe(htmlmin({collapseWhitespace: true, removeComments: true}))
	.pipe(gulp.dest('build'));
});

gulp.task('w3cjs', function () {
	gulp.src('index.html')
		.pipe(w3cjs());
});

gulp.task('connect', function() {
	connect.server({
		root: ['build'],
		port: 1337
	});
});

gulp.task('webshot', function() {

	var sizes = {
		'mobile'          : { w: 320, h: 500 },
		'tablet_portrait' : { w: 768, h: 500 },
		'tablet_landscape': { w: 1024, h: 768 },
		'laptop'          : { w: 1280, h: 800 },
		'desktop'         : { w: 1680, h: 1000 },
		'huge'            : { w: 2650, h: 2000 }
	};

	var dest = 'screens/';

	for(var i in sizes) {
		var name = i;
		takeScreenshot(name, dest, sizes[i].w, sizes[i].h);
	}
});

gulp.task('watch', function() {
	gulp.watch(paths.scripts, ['scripts']);
	gulp.watch(paths.images, ['images']);
	gulp.watch(paths.scss, ['styles']);
	gulp.watch(paths.html, ['html', 'w3cjs']);
});

function takeScreenshot(name, dest, w, h) {

	// Copying is a horrible hack, but I didn't find a way to tell webshot
	// what to name the png file...

	var from = './build/index.html';
	var to   = './build/' + name + '.html';

	fs.createReadStream(from).pipe(fs.createWriteStream(to));

	var returned = gulp.src(to).pipe(webshot({
		dest      :dest,
		p         :1337,
		screenSize: {
			width : w,
			height: h
		}
	}));

	setTimeout(function() {
		fs.unlink(to);
		return returned;
	}, 6000);
}

gulp.task('package', function() {

	var date = Date.now();

	var filename = date + '.zip';

	console.log('Creating ' + filename);

	gulp.src('./build/**/*')
		.pipe(zip(filename))
		.pipe(gulp.dest('./packages'));
});

gulp.task('default', ['scripts', 'images', 'styles', 'html', 'watch']);
gulp.task('shots', ['connect', 'webshot']);
gulp.task('zip', ['package']);
