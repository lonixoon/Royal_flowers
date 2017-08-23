const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const del = require('del');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const imageminPngquant = require('imagemin-pngquant');
const webpack = require('webpack-stream');
const named = require('vinyl-named');
const buffer = require('vinyl-buffer');
const merge = require('merge-stream');
const plugins = require('gulp-load-plugins')();
const fs = require('fs');
const nib = require('nib');

const SRC = 'src';
const PUBLIC = './';

// Pug
gulp.task('pug', (done) => {
  let pages = ['index', 'shlyapnie-korobki', 'classic', 'vase', 'millionroses'];
  pages.forEach(function(page) {
    gulp
      .src(`${SRC}/index.pug`)
      .pipe(plugins.data(function(file) {
        let data = JSON.parse( fs.readFileSync('./server/products/' + page + '.json') );
        return data;
      }))
      .pipe(plugins.plumber({ errorHandler: plugins.notify.onError() }))
      .pipe(plugins.pug())
      .pipe(plugins.rename(page + '.html'))
      .pipe(gulp.dest(PUBLIC));
  });
  done();
});


// Styles
gulp.task('styl', () =>
  gulp
    .src(`${SRC}/*.styl`)
    .pipe(plugins.stylus({
      compress: true,
      use:[ nib() ]
    }))
    .pipe(plugins.plumber({ errorHandler: plugins.notify.onError() }))
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(gulp.dest(PUBLIC))
);


// Scripts
gulp.task('js', () =>
  gulp
    .src(`${SRC}/*.js`)
    .pipe(plugins.plumber({
      errorHandler: plugins.notify.onError(err => ({
        title: 'Webpack',
        message: err.message
      }))
    }))
    .pipe(named())
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(plugins.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(PUBLIC))
);


// Static
gulp.task('static', () =>
  gulp
  .src(`${SRC}/static/**/*`)
  .pipe(plugins.imagemin([
    imageminJpegRecompress({
      loops: 4,
      min: 50,
      max: 65,
      quality: 'high',
      strip: true,
      progressive: true
    }),
    imageminPngquant({ quality: '50-80' }),
    plugins.imagemin.svgo({removeViewBox: true})
  ]))
  .pipe(gulp.dest(`${PUBLIC}/static`))
);


// Clean
gulp.task('cleanStatic', () => del(`${PUBLIC}/static`));


// Server
gulp.task('server', () => {
  browserSync.init({
    server: {
      baseDir: PUBLIC,
      index: 'index.html'
    },
    port: 8800,
    open: false,
    reloadOnRestart: true,
  });
});


// Watch
gulp.task('watch', () => {
  gulp.watch([`${SRC}/**/*.pug`, `${SRC}/index.pug`]).on('change', gulp.series('pug', browserSync.reload));
  gulp.watch([`${SRC}/**/*.styl`, `${SRC}/style.styl`]).on('change', gulp.series('styl', browserSync.reload));
  gulp.watch(`${SRC}/script.js`).on('change', gulp.series('js', browserSync.reload));
  gulp.watch(`${SRC}/static/**/*`).on('change', gulp.series('cleanStatic', 'static', browserSync.reload));
});


// Default
gulp.task('default', gulp.series(
  gulp.parallel('cleanStatic'),
  gulp.parallel('static', 'pug', 'styl', 'js'),
  gulp.parallel('server', 'watch')
));
