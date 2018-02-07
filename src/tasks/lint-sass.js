/* eslint-disable import/no-dynamic-require */
const path = require('path');
const stylelint = require('stylelint');
const { color } = require('../utils/stdoutColors');
const log = require('../utils/log')('sass linter', 'linter');

const { paths, values } = require(`${process.cwd()}/package.json`);

const isWatchMode = Array.from(process.argv).indexOf('--watch') >= 0;
const fix = Array.from(process.argv).indexOf('--fix') >= 0;

const configFile = path.resolve('../.stylelintrc');

const filesPaths = [
  `${path.resolve(paths.components)}/**/*.${values.entry}.scss`,
  `${path.resolve(paths.commons_path)}/**/*.scss`
];


const doMessage = function(warning) {
  const icon = warning.severity === 'warning' ? color('yellow', '  ⚠  ') : color('red', '  ✖  ');
  const message = `${warning.severity}${icon}${color('dim', `${warning.line}:${warning.column} - ${warning.text}`)}`;
  return console.log(message);
};

const runLinter = config =>
  stylelint.lint(config)
    .then((data) => {
      const { results } = data;
      if (data.errored) {
        log.error(`Sass linter has enconter a error`);
        results.forEach((result) => {
          if (result.warnings) {
            console.log(color('underscore', `\n${result.source}`));
            result.warnings.forEach(warning => doMessage(warning));
            console.log(`\n`);
          }
        });
        return log.info('\nReport done\n\n');
      }
      return log.success(`Sass linter -> 0 errors\n\n`);
    }).catch(err => log.error(err.stack));

const runAll = () =>
  filesPaths.forEach(files => runLinter({ files, configFile, fix }));

runAll();

if (isWatchMode) {
  const gaze = require('gaze');
  let timeout = false;
  filesPaths.forEach(file =>
    gaze(file, function() {
      // On changed/added/deleted
      this.on('all', (event, filepath) => {
        log.info(`${filepath} was ${event}`);
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => runLinter({ files: filepath, configFile, fix: false }), 100);
      });
    }));
}
