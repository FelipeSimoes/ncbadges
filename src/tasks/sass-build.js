/* eslint-disable import/no-dynamic-require */
const sass = require('node-sass');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const { color } = require('../utils/stdoutColors');
const log = require('../utils/log')('sass build', 'sass');

const { paths, values } = require(`${process.cwd()}/package.json`);
const sassFiles = {};

const isWatchMode = process.argv[(process.argv.length - 1)] === '--watch';

const sassFilePaths = [
  `${paths.commons_path}/**/*${values.entry}.scss`,
  `${paths.components}/**/*${values.entry}.scss`,
  `${paths.designs}/**/*${values.entry}.scss`,
];
// checking files
sassFilePaths.forEach(pattern => glob.sync(pattern)
  .forEach((entryFilePath) => {
    const key = path.dirname(entryFilePath);
    sassFiles[key] = entryFilePath;
  }));

if (Object.keys(sassFiles).length < 0) {
  process.exit(0);
}
/* eslint-disable no-console */
const handler = (folder, file) => {
  const outFile = `${folder}/${values.output}.css`;
  sass.render({
    file,
    outFile,
    sourceMap: true,
    includePaths: [paths.commons_path]
  }, (error, result) => {
    if (!error) {
      // No errors during the compilation, write this result on the disk
      return fs.writeFile(outFile, result.css, (err) => {
        if (!err) {
          return log.success(`${outFile} was compiled!`);
        }
        return log.error(`could not write file: ${err.Error} /n ${err.path}`);
      });
    }
    // console.log(color('dim', '\nCould not build file'));
    return console.log(`\n${color('underscore', file)} ${error.line}:${error.column} \n${color('red', error.formatted)}\n\n`);
  });
};

if (isWatchMode) {
  const gaze = require('gaze');
  sassFilePaths.forEach(pattern => gaze(pattern, function() {
    this.on('all', (event, filepath) => {
      setTimeout(() => handler(path.dirname(filepath), filepath), 100);
    });
  }));
}
// run
Object.keys(sassFiles).forEach(key => handler(key, sassFiles[key]));
