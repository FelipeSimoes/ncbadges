/* eslint-disable import/no-dynamic-require */
const path = require('path');
const { CLIEngine } = require('eslint');
const { color } = require('../utils/stdoutColors');
const log = require('../utils/log')('ES linter', 'linter');

const { paths, values } = require(`${process.cwd()}/package.json`);

const isWatchMode = process.argv[(process.argv.length - 1)] === '--watch';
const exitOnError = process.argv[(process.argv.length - 1)] !== '--no-exit-error';
const exitOnWarning = process.argv[(process.argv.length - 1)] === '--exit-warning';

const files = [
  `${path.resolve(paths.components)}/**/*.${values.entry}.js`,
  `${path.resolve(paths.publish)}/**/*.${values.entry}.js`,
  `${path.resolve(paths.commons_path)}/**/*.js`
];

const eslint = new CLIEngine({ fix: true });
/* eslint-disable no-console */
// check each error
const checkErrors = (item) => {
  const severity = {
    1: str => `${color('yellow', '  ⚠  ')}${color('dim', str)}`,
    2: str => `${color('red', '  ✖  ')}${color('dim', str)}`
  };
  const message = `${item.line}:${item.column} - ${item.message}`;
  console.error(`\x1b[0m ${severity[item.severity](message)}`);
};
// check each file
const checkFile = (file) => {
  const errors = file.errorCount - file.fixableErrorCount;
  const warnings = file.warningCount - file.fixableWarningCount;
  if (errors > 0 || warnings > 0) {
    // show message that we have a problem at file
    console.info(`\n${color('underscore', file.filePath)} (${color('red', errors)}/${color('yellow', warnings)})\n`);
    file.messages.forEach(item => checkErrors(item));
  }
  return { errors, warnings };
};

const runLinter = () => {
  const run = eslint.executeOnFiles(files);
  CLIEngine.outputFixes(run);
  const counts = run.results.map(file => checkFile(file));
  const errors = counts.reduce((count, next) => count + next.errors, 0);
  const warnings = counts.reduce((count, next) => count + next.warnings, 0);

  console.info(`\n${color('dim', 'Results:')}`);
  // erros resume and notifications
  if (errors > 0) {
    if (process.env.NODE_ENV !== 'production') {
      const notifier = require('node-notifier');
      notifier.notify({
        message: `You have ${errors} erros and ${warnings} on your code`,
        sound: true,
        title: '😪 JS Errors/ Warnings'
      });
    }
    if (exitOnError && !isWatchMode) {
      process.exit(-1);
    }
    return console.error(color('red', `---------> ✖ ${errors} errors.`));
  }
  // warning resume
  if (warnings > 0) {
    console.error(color('yellow', `---------> ⚠ ${warnings} Warnings.`));
    if (exitOnWarning && !isWatchMode) {
      process.exit(-1);
    }
    return console.info(`${color('dim', 'Done.')}\n`);
  }
  return console.info(`\n${color('green', '✓ No errors')}\n`);
};

// initial run
runLinter();

// watch
if (isWatchMode) {
  const gaze = require('gaze');
  let timeouts = false;
  const asyncRun = (message) => {
    log.info(message);
    if (timeouts) {
      clearTimeout(timeouts);
    }
    timeouts = setTimeout(() => {
      runLinter();
    }, 10);
  };
  const watch = function() {
    // On changed/added/deleted
    this.on('all', (event, filepath) => asyncRun(`${filepath} was ${event}`));
  };
  files.forEach(filePath => gaze(filePath, watch));
}

