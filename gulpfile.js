/* jshint -W069, -W079 */

/**
 *  draw
 *  (c) Rahmat Budiharso <rbudiharso@gmail.com>
 */

'use strict';
// generated on 2015-06-18 using generator-vars-webapp 0.5.0

// Patterns.
var IMAGES_PATTERN = '{jpg,jpeg,gif,png,svg,ico}';
var VIDEOS_PATTERN = '{ogv,mp4}';
var SCRIPTS_PATTERN = '{js,hbs}';
var SOURCEMAPS_PATTERN = '{css.map,js.map}';
var STYLES_PATTERN = '{css,styl}';
var TEMPLATES_PATTERN = '{html,shtml,htm,html.erb,asp,php}';
var EXTRAS_PATTERN = '{txt,htaccess}';
var FONTS_PATTERN = '{eot,svg,ttf,woff,woff2}';
var FILE_EXCLUDE_PATTERN = '{psd,ai}';

// Load modules.
var $ = require('gulp-load-plugins')();
var gulp = require('gulp');
var spawn = require('child_process').spawn;
var merge = require('merge-stream');
var sequence = require('run-sequence');

// Environment variables.
var debug = function() { return $.util.env['debug'] || $.util.env['d'] || process.env.GULP_CONFIG_DEBUG; };
var skipImageMin = function() { return $.util.env['skip-imagemin'] || $.util.env['si'] || debug(); };
var skipCSSO = function() { return $.util.env['skip-csso'] || $.util.env['sc'] || debug(); };
var skipUglify = function() { return $.util.env['skip-uglify'] || $.util.env['sj'] || debug(); };
var skipRev = function() { return $.util.env['skip-rev'] || $.util.env['sr'] || debug(); };
var skipMinifyHTML = function() { return $.util.env['skip-minify-html'] || $.util.env['sh'] || debug(); };
var skipRev = function() { return $.util.env['skip-rev'] || $.util.env['sr'] || debug(); };

/**
 * Compresses and deploys images to the build directory. Compression is skipped if --debug is specified.
 *
 * @param {Boolean} --debug         Specifies debug environment, skipping image compression.
 * @param {Boolean} --skip-imagemin Skips image compression.
 */
gulp.task('images', function()
{
    return gulp.src(['app/**/*'+IMAGES_PATTERN])
        .pipe($.if(!skipImageMin(), $.cache($.imagemin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [{cleanupIDs: false}]
        }))))
        .pipe(gulp.dest('.tmp'));
});

/**
 * Deploys videos to the staging directory.
 */
gulp.task('videos', function()
{
    return gulp.src(['app/**/*'+VIDEOS_PATTERN])
        .pipe(gulp.dest('.tmp'));
});

/**
 * Deploys all fonts from Bower components if applicable.
 */
gulp.task('fonts', function()
{
    gulp.src(require('main-bower-files')({ filter: '**/*.'+FONTS_PATTERN }).concat('app/fonts/**/*'))
        .pipe(gulp.dest('.tmp/fonts'));
});

/**
 * Processes all CSS files if preprocessed CSS languages are used (i.e. Stylus, Sass). Copies the processed
 * files to a temporary directory to be iterated on in subsequent tasks. Minification is done in the main 'build' task.
 *
 * @param {Boolean} --debug Specifies debug environment, skipping source mapping.
 */
gulp.task('styles', function()
{
    return gulp.src(['app/**/*'+STYLES_PATTERN])
        .pipe($.if(debug(), $.sourcemaps.init()))
        .pipe($.stylus({
            'include css': true
        }).on('error', $.util.log))
        .pipe($.postcss([require('autoprefixer-core')({ browsers: ['last 2 version', 'ie 9'] })]))
        .pipe($.if(debug(), $.sourcemaps.write()))
        .pipe(gulp.dest('.tmp'));
});

/**
 * Processes and lints all JavaScript files. If Browserify is included this task will bundle up all associated files. Processed
 * JavaScript files are copied to a temporary directory to be iterated on in subsequent tasks. Uglification is done in the main
 * 'build' task.
 *
 * @param {Boolean} --debug Specifies debug environment, skipping source mapping.
 */
gulp.task('scripts', function()
{
    var browserify = require('browserify');
    var reactify = require('reactify');
    var hbsfy = require('hbsfy');
    var through = require('through2');

    return gulp.src(['./app/**/*.'+SCRIPTS_PATTERN])
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe(through.obj(function(file, enc, next)
        {
            browserify({ entries: [file.path], debug: true, transform: [reactify, hbsfy] })
                .bundle(function(err, res)
                {
                    if (err) console.log(err.toString());
                    file.contents = res;
                    next(null, file);
                });
        }))
        .pipe($.if(debug(), $.sourcemaps.init({ loadMaps: true })))
        .pipe($.if(debug(), $.sourcemaps.write('./')))
        .pipe(gulp.dest('.tmp'));
});

/**
 * Deploys other miscellaneous files if applicable to the temporary directory.
 */
gulp.task('extras', function()
{
    return gulp.src(['app/**/*.'+EXTRAS_PATTERN], { dot: true })
        .pipe(gulp.dest('.tmp'));
});

/**
 * Processes all static files (i.e. images, fonts, stylesheets, scripts, etc) and deploys images, fonts and extra
 * files to the build directory. Styles and scripts remain in the temporary directory until the 'build' command is
 * invoked.
 *
 * @param {Boolean} --debug Specifies debug environment, skipping asset compression.
 */
gulp.task('static', ['images', 'videos', 'fonts', 'styles', 'scripts', 'extras'], function()
{
    return gulp.src(['.tmp/**/*.'+IMAGES_PATTERN, '.tmp/**/*.'+VIDEOS_PATTERN, '.tmp/**/*.'+FONTS_PATTERN, '.tmp/**/*.'+EXTRAS_PATTERN], { dot: true })
        .pipe(gulp.dest('build'));
});

/**
 * Processes all template files (i.e. HTML, etc) and deploys them to the temporary directory.
 */
gulp.task('templates', function()
{
    return gulp.src(['app/**/*.'+TEMPLATES_PATTERN])
        .pipe($.fileInclude({
            prefix: '@@',
            basepath: 'app/'
        }))
        .pipe(gulp.dest('.tmp'));
});

/**
 * Injects Bower components into template files.
 */
gulp.task('wiredep', function()
{
    var wiredep = require('wiredep').stream;

    gulp.src('app/**/*.'+TEMPLATES_PATTERN)
        .pipe(wiredep({
            exclude: ['bootstrap.css','bootstrap.js', 'modernizr'],
            directory: 'bower_components',
            ignorePath: /^(\.\.\/)*\.\./
        }))
        .pipe(gulp.dest('app'));
});

/**
 * Cleans the build and temporary directories.
 */
gulp.task('clean', function(callback)
{
    require('del')(['.tmp', 'build'], function()
    {
        $.cache.clearAll(callback);
    });
});

/**
 * Builds HTML templates. By default revision hash will be appended to the filename of stylesheets and scripts
 * and all HTML files will also be minified unless --debug is specified.
 *
 * @param {Boolean} --debug             Specifies debug environment for immediate and child tasks, skipping revisioning and
 *                                      subsequent asset compressions.
 * @param {Boolean} --skip-csso         Skips CSS compression.
 * @param {Boolean} --skip-uglify       Skips JavaScript compression.
 * @param {Boolean} --skip-minify-html  Skips HTML compression.
 * @param {Boolean} --skip-rev          Skips revisioning.
 */
gulp.task('build', ['static', 'templates'], function()
{
    var assets = $.useref.assets({searchPath: ['.tmp', '.']});

    return gulp.src(['.tmp/**/*.'+TEMPLATES_PATTERN])
        .pipe(assets)
        .pipe($.if(!skipCSSO(), $.if('*.css', $.csso())))
        .pipe($.if(!skipUglify(), $.if('*.js', $.uglify()))).on('error', $.util.log)
        .pipe($.if(!skipRev(), $.rev()))
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.if(!skipRev(), $.revReplace()))
        .pipe($.if(!skipMinifyHTML(), $.if('*.html', $.minifyHtml({empty: true, conditionals: true, loose: true }))))
        .pipe(gulp.dest('build'))
        .pipe($.size({ title: 'build', gzip: true }));
});

/**
 * Serves project to localhost and watches for file changes to auto rebuild. Specify debug to build
 * unique static file types separately without any sort of compression. This is recommended during
 * development.
 *
 * @param {Boolean} --debug Serve files from the temporary directory (loose files), defaults
 *                          to false (serve from build directory).
 * @param {Number}  --port  Optional port number (defaults to 9000).
 */
gulp.task('serve', function()
{
    var port = $.util.env['port'] || $.util.env['p'];
    var baseDir = (debug) ? '.tmp' : 'build';
    var browserSync = require('browser-sync');

    browserSync(
    {
        notify: false,
        port: (typeof port === 'number') ? port : 9000,
        server:
        {
            baseDir: [baseDir],
            routes:
            {
                '/bower_components': 'bower_components'
            }
        }
    });

    // Watch for changes.
    if (debug())
    {
        gulp.watch('app/**/*.'+IMAGES_PATTERN, function() { sequence('images', browserSync.reload); });
        gulp.watch('app/**/*.'+VIDEOS_PATTERN, function() { sequence('videos', browserSync.reload); });
        gulp.watch('app/**/*.'+STYLES_PATTERN, function() { sequence('styles', browserSync.reload); });
        gulp.watch('app/**/*.'+SCRIPTS_PATTERN, function() { sequence('scripts', browserSync.reload); });
        gulp.watch('app/**/*.'+FONTS_PATTERN, function() { sequence('fonts', browserSync.reload); });
        gulp.watch('app/**/*.'+TEMPLATES_PATTERN, function() { sequence('templates', browserSync.reload); });
    }
    else
    {
        gulp.watch('app/**/*.'+IMAGES_PATTERN, function() { sequence('build', browserSync.reload); });
        gulp.watch('app/**/*.'+VIDEOS_PATTERN, function() { sequence('build', browserSync.reload); });
        gulp.watch('app/**/*.'+STYLES_PATTERN, function() { sequence('build', browserSync.reload); });
        gulp.watch('app/**/*.'+SCRIPTS_PATTERN, function() { sequence('build', browserSync.reload); });
        gulp.watch('app/**/*.'+FONTS_PATTERN, function() { sequence('build', browserSync.reload); });
        gulp.watch('app/**/*.'+TEMPLATES_PATTERN, function() { sequence('build', browserSync.reload); });
    }
});

/**
 * Default task. Cleans the generated directories and builds the project.
 *
 * @param {Boolean} --debug Specifies debug environment, meaning all sub-tasks will be
 *                          iterated in this environment.
 * @param {Boolean} --serve Specifies whether the site should be served at the end of
 *                          this task.
 */
gulp.task('default', function(callback)
{
    var serve = $.util.env['serve'] || $.util.env['s'];

    var seq = ['clean', 'build'];
    if (serve) seq.push('serve');
    seq.push(callback);

    sequence.apply(null, seq);
});
