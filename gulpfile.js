var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del')
var runSequence = require('run-sequence');

//new plugins
// var plumber = require('gulp-plumber');
// var notify = require('gulp-notify');
// var autoprefixer = require('gulp-autoprefixer');


//task template
// gulp.task('taskName', ['runBefore', 'runBefore'], function() {
// 	return gulp.src('source-files') //get files
// 		.pipe(aPlugin())
// 		.pipe(gulp.dest('alteredFileDestination'))
// });

//error Handler
function errorHandler(err) {
	// Logs out error in the command line
	console.log("We just encountered an error, but gulp watch is still running.");
	console.log(err.toString());
	// Ends the current pipe, so Gulp watch doesn't break
	this.emit('end');
}

function customPlumber(errTitle) {
	return plumber({
		errorHandler: notify.onError({
			title: errTitle || "Error running Gulp",
			message: "Error: <%= error.message %",
		}) 
		// function(err) {
			//logs error in console
			// console.log(err.stack);
			//ends the current pipe, so Gulp watch doesn't break
			// this.emit('end');
		// }
	});
}

//scss to css
gulp.task('sass', function() {
	return gulp.src('app/scss/**/*.scss') //get files

		//use gulp plumber to catch errors from multiple plug-ins
		// pipe(customPlumber('Error Running Sass'))

		//throw errors with the errorHandler
		.pipe(sass().on('error', errorHandler))
		// .pipe(autoprefixer(){
		// 	// Adds prefixes for IE8, IE9 and last 2 versions of all other browsers
		// 	browsers: ['ie 8-9', `last 2 versions`],
		// remove: false
		// })
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

//gulp watch task template
//gulp.watch('files-to-watch', ['tasks', 'to', 'run']);

//our watch task
gulp.task('watch', ['browserSync', 'sass'], function() {

	//watch the scss and convert it to css
	gulp.watch('app/scss/**/*.scss', ['sass']);
	//watch all html files and update them
	gulp.watch('app/*html', browserSync.reload);
	//watch all javascript files and update them
	gulp.watch('app/js/**/*.js', browserSync.reload);


});



gulp.task('browserSync', function() {	
	browserSync.init({
		server: { baseDir: 'app' },
	})
});



//optimize assets
gulp.task('useref', function() {
	return gulp.src('app/*.html') 
		.pipe(useref())
		//minifies only if it's a Javascript file
		.pipe(gulpIf('*.js', uglify()))
		//minifies only if it's a CSS file
		.pipe(gulpIf('*.css', cssnano()))
		.pipe(gulp.dest('dist'))
});

gulp.task('images', function() {
	return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
		//optimize images
		.pipe(cache(imagemin({
			// Setting gifs to interlaced
      		interlaced: true
		})))
		.pipe(gulp.dest('dist/images'))
});

gulp.task('fonts', function() {
	return gulp.src('app/fonts/**/*')
	.pipe(gulp.dest('dist/fonts'))
});

gulp.task('clean:dist', function() {
	return del.sync('dist');
});






//default task for production
gulp.task('live-in-browser', function(callback){
	runSequence(['sass','browserSync', 'watch'],
	 callback
	 )
});

//when it's time for distribution
gulp.task('build', function(callback){
	runSequence('clean:dist',['sass','useref','images','fonts'],
	 callback
	 )
});




















