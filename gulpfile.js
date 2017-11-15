/******************************************************
 * PATTERN LAB NODE
 * EDITION-NODE-GULP
 * The gulp wrapper around patternlab-node core, providing tasks to interact with the core library and move supporting frontend assets.
******************************************************/
var gulp = require('gulp'),
  path = require('path'),
  argv = require('minimist')(process.argv.slice(2)),
  _ = require('lodash');

/**
 * Normalize all paths to be plain, paths with no leading './',
 * relative to the process root, and with backslashes converted to
 * forward slashes. Should work regardless of how the path was
 * written. Accepts any number of parameters, and passes them along to
 * path.resolve().
 *
 * This is intended to avoid all known limitations of gulp.watch().
 *
 * @param {...string} pathFragment - A directory, filename, or glob.
*/
function normalizePath() {
  return path
    .relative(
      process.cwd(),
      path.resolve.apply(this, arguments)
    )
    .replace(/\\/g, "/");
}

/******************************************************
 * PATTERN LAB CONFIGURATION - API with core library
******************************************************/
//read all paths from our namespaced config file
var config = require('./patternlab-config.json'),
  patternlab = require('patternlab-node')(config);

function paths() {
  return config.paths;
}

function getConfiguredCleanOption() {
  return config.cleanPublic;
}

function getPathsToCopy() {
  const pathsToCopy = _.cloneDeep(paths());
  delete pathsToCopy.source.root;
  delete pathsToCopy.source.patterns;
  delete pathsToCopy.source.data;
  delete pathsToCopy.source.meta;
  delete pathsToCopy.source.annotations;
  delete pathsToCopy.source.styleguide;
  delete pathsToCopy.source.patternlabFiles;
  return pathsToCopy;
}

/**
 * Performs the actual build step. Accomodates both async and sync
 * versions of Pattern Lab.
 * @param {function} done - Gulp done callback
 */
function build(done) {
  //const buildResult = patternlab.build(
  const buildResult = patternlab.serve(
    () => {}, {
      cleanPublic: getConfiguredCleanOption(),
      watch: true
    }
  );

  patternlab.events.on('patternlab-asset-change', (data) => {
    console.log(126, 'EDITION EVENT! ', data);
  })

  // handle async version of Pattern Lab
  if (buildResult instanceof Promise) {
    return buildResult.then(done);
  }

  // handle sync version of Pattern Lab
  done();
  return null;
}

gulp.task('patternlab:version', function (done) {
  patternlab.version();
  done();
});

gulp.task('patternlab:help', function (done) {
  patternlab.help();
  done();
});

gulp.task('patternlab:patternsonly', function (done) {
  patternlab.patternsonly(done, getConfiguredCleanOption());
});

gulp.task('patternlab:liststarterkits', function (done) {
  patternlab.liststarterkits();
  done();
});

gulp.task('patternlab:loadstarterkit', function (done) {
  patternlab.loadstarterkit(argv.kit, argv.clean);
  done();
});

gulp.task('patternlab:build', gulp.series(build));

gulp.task('patternlab:installplugin', function (done) {
  patternlab.installplugin(argv.plugin);
  done();
});

/******************************************************
 * COMPOUND TASKS
******************************************************/
gulp.task('default', gulp.series('patternlab:build'));
gulp.task('patternlab:watch', gulp.series('patternlab:build', watch));
gulp.task('patternlab:serve', gulp.series('patternlab:build', 'patternlab:connect', watch));
