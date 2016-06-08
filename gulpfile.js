'use strict';

var gulp = require('gulp');  // Base gulp package
var babelify = require('babelify'); // Used to convert ES6 & JSX to ES5
var browserify = require('browserify'); // Providers "require" support, CommonJS
var notify = require('gulp-notify'); // Provides notification to both the console and Growel
var rename = require('gulp-rename'); // Rename sources
var sourcemaps = require('gulp-sourcemaps'); // Provide external sourcemap files
// var livereload = require('gulp-livereload'); // Livereload support for the browser
var gutil = require('gulp-util'); // Provides gulp utilities, including logging and beep
var chalk = require('chalk'); // Allows for coloring for logging
var source = require('vinyl-source-stream'); // Vinyl stream support
var buffer = require('vinyl-buffer'); // Vinyl stream support
var watchify = require('watchify'); // Watchify for source changes
var merge = require('utils-merge'); // Object merge tool
var duration = require('gulp-duration'); // Time aspects of your gulp process
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var yargs = require('yargs');
var gulpif = require('gulp-if');
var autoprefixer = require ('gulp-autoprefixer');
var cssnano = require ('gulp-cssnano');
var imagemin = require ('gulp-imagemin');
var uglify = require ('gulp-uglify');
var del = require ('del');
var mkdirp = require ('mkdirp');
var file = require ('gulp-file');


//checa el argumento --production
var PRODUCTION = !!(yargs.argv.production);

gulp.task('test', function(){
    console.log(PRODUCTION);
});


// Configuration for Gulp
var config = {
    js: {
        src: './src/assets/js/main.jsx',
        srcDir: './src/assets/js',
        watch: './src/assets/js/**/*', 
        outputDir: './dist/assets/js',
        outputFile: 'app.js',
        inputFile: 'main.jsx',
        sourceMap: './dist/assets/js/sourceMap'
    },
    scss: {
        src: './src/assets/scss',
        watch: 'src/assets/scss/**/*',     //gulp watch no funciona con rutas absolutas
        outputDir: './dist/assets/css',
        inputFile: './src/assets/scss/main.scss',
        inputFileName: 'main.scss',
        inputDir: './src/assets/scss',
        outputFile: 'styles.css'
    },
    html: {
        src: './src/*.html',
        watch: 'src/*.html',
        outputDir: './dist'
    },
    images:{
        src: './src/assets/img/**/*',
        watch: 'src/assets/img/**/*',
        outputDir: './dist/assets/img'
    },
    copy: {
        src: ['src/**/*', '!./src/assets/{img,js,scss}', '!./src/assets/{img,js,scss}/**/*'],
        outputDir: './dist'
    },
    server: {
        baseDir: "./dist",
        server: "./dist"
    },
    src:{
        baseDir: "./src",
        dirs: ['./src/assets/fonts',
               './src/assets/img',
               './src/assets/js',
               './src/assets/scss']
    }
};

// Error reporting function
function mapError(err) {
    if (err.fileName) {
        // Regular error
        gutil.log(chalk.red(err.name)
            + ': ' + chalk.yellow(err.fileName.replace(__dirname + '/src/js/', ''))
            + ': ' + 'Line ' + chalk.magenta(err.lineNumber)
            + ' & ' + 'Column ' + chalk.magenta(err.columnNumber || err.column)
            + ': ' + chalk.blue(err.description));
    } else {
        // Browserify error..
        gutil.log(chalk.red(err.name)
            + ': '
            + chalk.yellow(err.message));
    }
}

gulp.task('serve', function(cb){
    browserSync.init({
        server: {
            baseDir: config.server.baseDir,
            server: config.server.server
        }
    });
    
    setTimeout(function(){
        cb();
    },1000);
});

gulp.task('copy', function(cb){
    return gulp.src(config.copy.src)
        .pipe(gulp.dest(config.copy.outputDir))
});

gulp.task('clean:dist', function(cb){
    del.sync([
        './dist'
    ]);
    mkdirp.sync('./dist');
    cb();
});

gulp.task('clean:all', function(cb){
    del.sync([
        './dist',
        './src'
    ]);
    cb();
});


gulp.task('initialize', ["clean:all"], function(){
    config.src.dirs.map(function(dir){
        mkdirp.sync(dir);
    });
    mkdirp.sync('./dist');
    
    file(config.js.inputFile,'')
        .pipe(gulp.dest(config.js.srcDir));
        
    file(config.scss.inputFileName,'')
        .pipe(gulp.dest(config.scss.inputDir));
  
});

// Completes the final file outputs
function bundle(bundler) {
    var bundleTimer = duration('Javascript bundle time');
    if(PRODUCTION){
        del([config.js.sourceMap]);
    }
    
    console.log('Iniciando bundler js <<<<<<<<<<<<<<<<<<<<<<<<<<');
    bundler
        .bundle()
        .on('error', mapError) // Map error reporting
        .pipe(source('main.jsx')) // Set source name
        .pipe(buffer()) // Convert to gulp pipeline
        .pipe(rename(config.js.outputFile)) // Rename the output file
        .pipe(gulpif(!PRODUCTION, sourcemaps.init({ loadMaps: true }))) // Extract the inline sourcemaps
        .pipe(gulpif(!PRODUCTION, sourcemaps.write('./sourceMap'))) // Set folder for sourcemaps to output to
        .pipe(gulpif(PRODUCTION, uglify().on('error', function(e){console.log(e);})))
        .pipe(gulp.dest(config.js.outputDir)) // Set the output folder        
        .pipe(notify({
            message: 'Archivo Generado: \n-----------\n<%= file.relative %>\n-----------',
        })) // Output the file being created
        .pipe(bundleTimer) // Output time timing of the file creation
        .pipe(browserSync.stream({match:"**/*.js"}));
        
        // browserSync.reload("*.js");
}

//con el parametro --production no se ejecuta watchify
gulp.task('js', function(){
    if(!(PRODUCTION)){
        var args = merge(watchify.args, { debug: true }); // Merge in default watchify args with browserify arguments
        
        var bundler = browserify(config.js.src, args) // Browserify
            .plugin(watchify, { ignoreWatch: ['**/node_modules/**', '**/bower_components/**'] }) // Watchify to watch source file changes
            .transform(babelify, { presets: ['es2015', 'react'], plugins: ['lodash'] }); // Babel tranforms

        bundle(bundler); // Run the bundle the first time (required for Watchify to kick in)

        bundler.on('update', function () {
            bundle(bundler); // Re-run bundle on source updates
        });
    }else{
        var args = {debug: false};
        var bundler = browserify(config.js.src, args) // Browserify
            .transform(babelify, { presets: ['es2015', 'react'], plugins: ['lodash'] }); // Babel tranforms

        bundle(bundler); // Run the bundle the first time (required for Watchify to kick in)
    }
});

gulp.task('scss', function(){
    var bundleTimer = duration('SCSS tiempo de compilacion: ');
     
    return gulp.src(config.scss.inputFile)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({browser: 'last 2 versions'}))
        .pipe(gulpif(PRODUCTION, cssnano()))
        .pipe(gulpif(!PRODUCTION, sourcemaps.write()))
        .pipe(rename(config.scss.outputFile))
        .pipe(gulp.dest(config.scss.outputDir))        
        .pipe(notify({
            message: 'Archivo Generado: \n-----------\n<%= file.relative %>\n-----------',
        })) // Output the file being created
        .pipe(bundleTimer) // Output time timing of the file creation   
        .pipe(browserSync.stream({match:"**/*.css"}));
});

gulp.task('html', function(){
    del.sync([config.html.outputDir + '/*.html']);
    
    console.log("ejecutando tarea HTML <<<<<<<<<<")
    return gulp.src(config.html.src)
        .pipe(gulp.dest(config.html.outputDir))
        .pipe(browserSync.stream({once:true}));
});

gulp.task('images', function(){
    del.sync([config.images.outputDir + '/**/*']);
    
    console.log("Ejecutando Imagenes <<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
    return gulp.src(config.images.src)
        .pipe(gulpif(PRODUCTION, imagemin({
            progressive: true
        })))
        .pipe(gulp.dest(config.images.outputDir))
        .pipe(browserSync.stream());
});

gulp.task('reload', function(cb){
    browserSync.reload();
    cb();
});


//Tarea para observar cambios en src
//la observacion de los cambios en los js la hace
//directamente watchify
gulp.task('watch', function(){
    
    gulp.watch(config.html.watch, ['html']);
    gulp.watch(config.scss.watch, ['scss']);
    gulp.watch(config.images.watch, ['images']);
    // gulp.watch(config.js.outputDir+'/app.js', browserSync.reload);
});

gulp.task('start', ['clean:dist', 'copy', 'serve', 'js', 'scss', 'html', 'images', 'watch']);
gulp.task('compile', ['clean:dist', 'copy', 'js', 'scss', 'html', 'images']);