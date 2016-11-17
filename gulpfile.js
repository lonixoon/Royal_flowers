const gulp = require('gulp');
const gulpsync = require('gulp-sync')(gulp);
const plugins = require('gulp-load-plugins')();
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const imageminPngquant = require('imagemin-pngquant');
const fs = require('fs');
const nib = require('nib');
const del = require('del');
const webpack = require('webpack-stream');
const named = require('vinyl-named');

const publicDir = './public';

gulp.task('pug', () => {
  let pages = ['index', 'shlyapnie-korobki', 'classic', 'vase', 'millionroses'];
  pages.forEach(function(page) {
    gulp
      .src('./src/index.pug')
      .pipe(plugins.data(function(file) {
        let data = JSON.parse( fs.readFileSync('./server/products/' + page + '.json') );
        return data;
      }))
      .pipe(plugins.plumber({ errorHandler: plugins.notify.onError() }))
      .pipe(plugins.pug( { pretty: true } ))
      .pipe(plugins.rename(page + '.html'))
      .pipe(gulp.dest(publicDir));
  });
});

gulp.task('styl', () => {
  gulp
    .src('./src/style.styl')
    .pipe(plugins.stylus({
      compress: true,
      use:[ nib() ]
    }))
    .pipe(plugins.plumber({ errorHandler: plugins.notify.onError() }))
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(gulp.dest(publicDir))
});

gulp.task('js', () => {
  gulp
  .src('./src/script.js')
  .pipe(plugins.plumber({
    errorHandler: plugins.notify.onError(err => ({
      title: 'Webpack',
      message: err.message
    }))
  }))
  .pipe(named())
  .pipe(webpack(require('./webpack.config.js')))
  .pipe(plugins.rename({suffix: '.min'}))
  .pipe(gulp.dest(publicDir));
});

gulp.task('media', () => {
  gulp
  .src('./src/static/**/*')
  .pipe(plugins.imagemin([
    imageminJpegRecompress({
      loops: 4,
      min: 50,
      max: 80,
      quality: 'high',
      strip: true,
      progressive: true
    }),
    imageminPngquant({ quality: '50-80' }),
    plugins.imagemin.svgo({removeViewBox: true})
  ]))
  .pipe(gulp.dest(publicDir + '/static'));
});

gulp.task('browser-sync', () => {
  browserSync({
    server: {
      baseDir: publicDir,
      index: 'index.html'
    },
    port: '8800',
    notify: false
  });
});

gulp.task('clean', () => {
  return del(publicDir);
});

gulp.task('default', gulpsync.sync(['clean', 'media', 'pug', 'styl', 'js', 'browser-sync']), () => {
  gulp.watch(['./src/static/*'], ['media']).on('change', reload);
  gulp.watch('./src/**/*.pug', ['pug']).on('change', reload);
  gulp.watch('./src/**/*.styl', ['styl']).on('change', reload);
  gulp.watch(['./src/**/*.js'], ['js']).on('change', reload);
});
