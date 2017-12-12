var gulp = require('gulp')
var async = require('async')
var run = require('run-sequence')
var uglify = require('gulp-uglify')
var templateCache = require('gulp-angular-templatecache')
var concat = require('gulp-concat')
var plumber = require('gulp-plumber')
var gutil = require('gulp-util')
var sass = require('gulp-sass')
var autoprefixer = require('gulp-autoprefixer')
var htmlmin = require('gulp-htmlmin')
var sourcemaps = require('gulp-sourcemaps')
var nodemon = require('gulp-nodemon')
var path = require('path')

// error function for plumber
var onError = function (err) {
  gutil.beep()
  console.log(err)
  this.emit('end')
}

var config = {
  sass: {
    src: 'src/styles/main.scss',
    options: {
      noCache: true,
      compass: false,
      bundleExec: true,
      sourcemap: true,
      outputStyle: 'compressed',
      includePaths: ['node_modules/govuk-elements-sass/public/sass', 'node_modules/govuk_frontend_toolkit/stylesheets']
    }
  },
  autoprefixer: {
    browsers: [
      'last 2 versions',
      'safari 5',
      'ie 8',
      'ie 9',
      'opera 12.1',
      'ios 6',
      'android 4'
    ],
    cascade: true
  }
}

gulp.task('assets', function () {
  gulp.src(['src/assets/**/*']).pipe(gulp.dest('dist/assets'))
})

gulp.task('sass', function () {
  return gulp.src(config.sass.src)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(autoprefixer(config.autoprefixer.browsers))
    .pipe(sass(config.sass.options)) // Using gulp-sass
    .pipe(gulp.dest('dist/styles'))
})

gulp.task('minifyHtml', function () {
  return gulp.src('src/*.html')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'))
})

//
gulp.task('uglify', function () {
  return gulp.src([
    'src/app/main.js',
    '_temp/templates.js',
    'src/app/modules/**/*.js'
  ])
  .pipe(sourcemaps.init())
  .pipe(plumber())
  .pipe(uglify())
  .pipe(concat('main.js'))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('dist/app'))
})

gulp.task('angTemplates', function () {
  return gulp.src('src/app/modules/**/*templates/*.html')
  .pipe(plumber())
  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(templateCache({root: 'modules/', module: 'hod.proving'}))
  .pipe(gulp.dest('_temp'))
})

gulp.task('vendor', function () {
  return gulp.src([
    'node_modules/angular/angular.min.js',
    'node_modules/angular-aria/angular-aria.min.js',
    'node_modules/angular-ui-router/release/angular-ui-router.min.js',
    'node_modules/angular-ui-validate/dist/validate.min.js',
    'node_modules/underscore/underscore-min.js',
    'node_modules/moment/min/moment.min.js'
  ])
  .pipe(plumber())
  .pipe(concat('vendor.js'))
  .pipe(gulp.dest('dist/app'))
})

gulp.task('templateAndUglify', function () {
  async.series([
    function (done) {
      run(['angTemplates'], function () {
        done()
      })
    },
    function (done) {
      run(['uglify'], function () {
        done()
      })
    }
  ], function () {
    console.log('templateAndUglify done')
  })
})

gulp.task('startwatch', function () {
  nodemon({
    script: 'server.js',
    ext: 'js',
    env: { 'NODE_ENV': 'development' },
    cwd: __dirname,
    ignore: ['node_modules/**'],
    watch: ['server.js', 'config.js', 'src/node/*']
  })
  gulp.watch('src/index.html', ['minifyHtml'])
  gulp.watch('src/app/modules/**/*.html', ['templateAndUglify'])
  gulp.watch(['src/app/main.js', 'src/app/modules/**/*.js'], ['uglify'])
  gulp.watch('src/styles/*.scss', ['sass'])
})

gulp.task('test', function (done) {
  var karma = require('karma')
  var server = new karma.Server({ configFile: path.join(__dirname, '/karma.conf.js') }, done)
  server.start()
})

gulp.task('watch', ['startwatch', 'vendor'])
gulp.task('default', ['assets', 'sass', 'minifyHtml', 'vendor', 'templateAndUglify'])
gulp.task('inline', ['default', 'inlineHTML'])
