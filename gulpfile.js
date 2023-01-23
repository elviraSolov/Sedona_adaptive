import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import csso from 'postcss-csso';
import terser from 'gulp-terser';
import rename from 'gulp-rename';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import del from 'del';

// Styles
export const styles = () => {
  return gulp.src('docs/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

//HTML
const html = () => {
  return gulp.src('docs/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(htmlmin({ ignoreCustomFragments: [ /<br>\s/gi ]}))
    .pipe(gulp.dest('build'));
}

//Scripts
const script = () => {
  return gulp.src('docs/js/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'))
    .pipe(browser.stream());
}

//Images
const optimizeImages = () => {
  return gulp.src('docs/img/**/*.{png,jpg}')
  .pipe(squoosh())
  .pipe(gulp.dest('build/img'))
}

const copyImages = () => {
  return gulp.src('docs/img/**/*.{png,jpg}')
  .pipe(gulp.dest('build/img'))
}

//WebP
const createWebp = () => {
  return gulp.src('docs/img/**/*.{png,jpg}')
    .pipe(squoosh({
      webp: {}
    }))
    .pipe(gulp.dest('build/img'));
}

//SVG
const svg = () =>
  gulp.src(['docs/img/*.svg', '!docs/img/icons/*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/img'));

const sprite = () => {
  return gulp.src('docs/img/icons/*.svg')
    .pipe(svgo())
    .pipe(svgstore({
      inlineSvg: true
  }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
}

//Copy
const copy = (done) => {
  gulp.src([
    'docs/fonts/*.{woff2,woff}',
    'docs/*.ico',
  ], {
    base: 'docs'
  })
  .pipe(gulp.dest('build'))
  done();
}

// Clean
const clean = () => {
  return del('build');
};

// Server
const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload
const reload = (done) => {
  browser.reload();
  done();
}

// Watcher
const watcher = () => {
  gulp.watch('docs/sass/**/*.scss', gulp.series(styles));
  gulp.watch('docs/js/script.js', gulp.series(script));
  gulp.watch('docs/*.html', gulp.series(html, reload));
}

// Build
export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    script,
    svg,
    sprite,
    createWebp
  ),
);

// Default
export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    script,
    svg,
    sprite,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  )
);
