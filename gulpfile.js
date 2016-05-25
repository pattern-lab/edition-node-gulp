/******************************************************
 * DESCRIPTION
 * Special thanks to oscar-g (https://github.com/oscar-g) for starting this at https://github.com/oscar-g/patternlab-node/tree/dev-gulp
******************************************************/
var pkg = require('./package.json'),
    gulp = require('gulp'),
    path = require('path'),
    del = require('del'),
    browserSync = require('browser-sync').create();

require('gulp-load')(gulp);

/******************************************************
 * PATTERN LAB CONFIGURATION
******************************************************/
//read all paths from our namespaced config file
var config = require('./patternlab-config.json'),
    pl = require('patternlab-node')(config);

function paths() {
  return config.paths;
}

gulp.task('patternlab', ['prelab'], function (done) {
  pl.build(true);
  done();
});

//clean patterns dir
gulp.task('pl-clean', function(cb){
  del.sync([path.resolve(paths().public.patterns, '*')], {force: true});
  cb();
});

/******************************************************
 * COPY TASKS
******************************************************/
// JS copy
gulp.task('pl-copy:js', function(){
  return gulp.src('**/*.js', {cwd: path.resolve(paths().source.js)} )
    .pipe(gulp.dest(path.resolve(paths().public.js)));
});

// Images copy
gulp.task('pl-copy:img', function(){
  return gulp.src(
    [ '**/*.gif', '**/*.png', '**/*.jpg', '**/*.jpeg'  ],
    {cwd: path.resolve(paths().source.images)} )
    .pipe(gulp.dest(path.resolve(paths().public.images)));
});

// Fonts copy
gulp.task('pl-copy:font', function(){
  return gulp.src('*', {cwd: path.resolve(paths().source.fonts)})
    .pipe(gulp.dest(path.resolve(paths().public.fonts)));
});

// Data copy
gulp.task('pl-copy:data', function(){
  return gulp.src('annotations.js', {cwd: path.resolve(paths().source.data)})
    .pipe(gulp.dest(path.resolve(paths().public.data)));
});

// CSS Copy
gulp.task('pl-copy:css', function(){
  return gulp.src(path.resolve(paths().source.css, 'style.css'))
    .pipe(gulp.dest(path.resolve(paths().public.css)))
    .pipe(browserSync.stream());
});

// Styleguide Copy
gulp.task('pl-copy:styleguide', function(){
  return gulp.src(path.resolve(paths().source.styleguide, '**/*'))
    .pipe(gulp.dest(path.resolve(paths().public.root)))
    .pipe(browserSync.stream());
});


/******************************************************
 * SERVER AND WATCH TASKS
******************************************************/
// watch task utility functions
function getSupportedTemplateExtensions() {
  var engines = require('./node_modules/patternlab-node/core/lib/pattern_engines');
  return engines.getSupportedFileExtensions();
}
function getTemplateWatches() {
  return getSupportedTemplateExtensions().map(function (dotExtension) {
    return path.resolve(paths().source.patterns, '**/*' + dotExtension);
  });
}

gulp.task('pl-connect', ['lab'], function() {
  browserSync.init({
    server: {
      baseDir: path.resolve(paths().public.root)
    },
    snippetOptions: {
      // Ignore all HTML files within the templates folder
      blacklist: ['/index.html', '/', '/?*']
    },
    notify: {
      styles: [
        'display: none',
        'padding: 15px',
        'font-family: sans-serif',
        'position: fixed',
        'font-size: 1em',
        'z-index: 9999',
        'bottom: 0px',
        'right: 0px',
        'border-top-left-radius: 5px',
        'background-color: #1B2032',
        'opacity: 0.4',
        'margin: 0',
        'color: white',
        'text-align: center'
      ]
    }
  });
  gulp.watch(path.resolve(paths().source.css, '**/*.css'), ['pl-copy:css']);

  gulp.watch(path.resolve(paths().source.styleguide, '**/*.*'), ['pl-copy:styleguide']);

  var patternWatches = [
    path.resolve(paths().source.patterns, '**/*.json'),
    path.resolve(paths().source.data, '*.json'),
    path.resolve(paths().source.fonts + '/*'),
    path.resolve(paths().source.images + '/*'),
    path.resolve(paths().source.annotations + '/*')
  ].concat(getTemplateWatches());

  gulp.watch(patternWatches, ['lab-pipe'], function () { browserSync.reload(); });
});

gulp.task('lab-pipe', ['lab'], function(cb){
  cb();
  browserSync.reload();
});

gulp.task('default', ['lab']);

gulp.task('assets', ['pl-copy:js', 'pl-copy:img', 'pl-copy:font', 'pl-copy:data', 'pl-copy:css', 'pl-copy:styleguide' ]);
gulp.task('prelab', ['pl-clean', 'assets']);
gulp.task('lab', ['prelab', 'patternlab'], function(cb){cb();});
gulp.task('patterns', ['patternlab:only_patterns']);
gulp.task('pl-serve', ['lab', 'pl-connect']);

gulp.task('version', ['patternlab:version']);
gulp.task('help', ['patternlab:help']);
