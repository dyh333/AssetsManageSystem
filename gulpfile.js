// 引入 gulp
var gulp = require('gulp'); 
var gutil = require('gulp-util');

// 引入组件
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var watchPath = require('gulp-watch-path');


// 检查脚本
gulp.task('lint', function() {
    gulp.src('./src/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// 编译Sass
gulp.task('sass', function() {
    gulp.src('./scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./css'));
});

// 压缩 css 文件
// gulp.task('css', function () {
    // // 1. 找到文件
    // gulp.src('./src/css/*.css')
    // // 2. 压缩文件
        // .pipe(minifyCSS())
    // // 3. 另存为压缩文件
        // .pipe(gulp.dest('dist/css'))
// });

// 压缩图片任务// 在命令行输入 gulp images 启动此任务
gulp.task('images', function (event) {
    // 1. 找到图片
    gulp.src('./src/imgs/*.*')
    // 2. 压缩图片
        .pipe(imagemin({
            progressive: true
        }))
    // 3. 另存图片
        .pipe(gulp.dest('./dist/imgs'))
});

// 合并，压缩文件
// gulp.task('scripts', function() {
    // gulp.src(['./src/js/*.js'])
        // // .pipe(concat('all.js'))
        // // .pipe(gulp.dest('./dist'))
        // // .pipe(rename('all.min.js'))
        // .pipe(uglify())
        // .pipe(gulp.dest('./dist'));
		
	// gulp.src(['./src/js/app/*.js'])
        // .pipe(uglify())
        // .pipe(gulp.dest('./dist/app'));
// });

gulp.task('watchjs', function () {
    gulp.watch(['./src/js/app/*.js', './src/js/*.js'], function (event) {
        var paths = watchPath(event, 'src/', 'dist/')
        /*
        paths
            { srcPath: 'src/js/log.js',
              srcDir: 'src/js/',
              distPath: 'dist/js/log.js',
              distDir: 'dist/js/',
              srcFilename: 'log.js',
              distFilename: 'log.js' }
        */
        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        gulp.src(paths.srcPath)
            .pipe(uglify())
            .pipe(gulp.dest(paths.distDir))
    })
});

gulp.task('watchcss', function () {
    gulp.watch('./src/css/*.css', function (event) {
        var paths = watchPath(event, 'src/', 'dist/')

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        gulp.src(paths.srcPath)
            .pipe(minifycss())
            .pipe(gulp.dest(paths.distDir))
    })
});

gulp.task('watchimage', function () {
    gulp.watch(['./src/imgs/*.*', './src/imgs/**/*.*'], function (event) {
        var paths = watchPath(event,'src/','dist/')

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        gulp.src(paths.srcPath)
            .pipe(imagemin({
                progressive: true
            }))
            .pipe(gulp.dest(paths.distDir))
    })
});


// 默认任务
gulp.task('default', ['watchjs','watchcss', 'watchimage'], function(){
    //gulp.run('lint', 'css', 'images', 'scripts');  //'sass', 
	
    // // 监听文件变化，当文件被修改则执行任务
	// gulp.watch(['./src/css/*.css'], function(){
        // gulp.run('css'); 
    // });
    // gulp.watch(['./src/js/*.js', './src/js/app/*.js'], function(event){
        // gulp.run('lint', 'scripts'); 
    // });
	
});