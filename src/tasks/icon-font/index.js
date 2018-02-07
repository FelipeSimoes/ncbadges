/* eslint-disable import/no-dynamic-require */
const fs = require('fs');
const path = require('path');
const dataURI = require('datauri').promise;
const mkdirp = require('mkdirp');
const getDirName = require('path').dirname;

require.extensions['.svg'] = function(module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

const template = require('./template.scss.js');
const config = require('../../configs/icons.config.js');

const svg = require(`${config.path}/${config.name}.svg`);

const getProp = (prop, str, sep = '"') => {
  const sub = str.slice(str.indexOf(prop));
  return sub.replace(`${prop}=${sep}`, '').split(sep).shift();
};

const writeFile = function(currentPath, contents, cb) {
  mkdirp(getDirName(currentPath), (err) => {
    if (err) return cb(err);

    return fs.writeFile(currentPath, contents, cb);
  });
};

dataURI(path.resolve(`${config.path}/${config.name}.ttf`))
  .then((font) => {
    config.font = font;
    const glyphs = svg.split('<glyph').map((svgGlyph) => {
      const name = getProp('glyph-name', svgGlyph);
      const unicode = getProp('unicode', svgGlyph).toUpperCase().replace(/&#X|;/gi, '');
      const tags = getProp('data-tags', svgGlyph);
      return { name, unicode, tags };
    });
    const content = template(config, glyphs);

    writeFile(path.resolve(`${config.path}/${config.sass}`), content, (fileError) => {
      if (fileError) {
        // alert a error at the console / terminal without breaking the build
        console.log('could not write the file', fileError);
        // throw error and break the build
        throw fileError;
      }
    });
  })
  .catch((e) => { throw e; });
