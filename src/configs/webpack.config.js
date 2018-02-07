/* eslint-disable import/no-dynamic-require */
const path = require('path');
const webpack = require('webpack');
const glob = require('glob');
const babelConfig = require('./babel.config');
const alias = require('./webpack.alias');

const isProduction = process.env.NODE_ENV === 'production';
const frontendPath = process.cwd();

const { paths, values } = require(`${frontendPath}/package.json`);
const projectRoot = path.resolve(frontendPath, paths.root);
const componentsRoot = path.resolve(frontendPath, paths.components);
const pathBabelLoader = require.resolve('babel-loader');
const filePathCommonChunk = path.join(
  path.relative(paths.root, `${paths.common}/js`),
  `common.${values.output}.js`
);
const entryConfig = {};

glob.sync(`${paths.components}/**/*${values.entry}.js`)
  .forEach((entryFilePath) => {
    const key = path.dirname(path.relative(paths.root, entryFilePath));
    entryConfig[key] = entryFilePath;
  });

glob.sync(`${paths.publish}/**/*${values.entry}.js`)
  .forEach((entryFilePath) => {
    const key = path.dirname(path.relative(paths.root, entryFilePath));
    entryConfig[key] = entryFilePath;
  });


if (Object.keys(entryConfig).length < 0) {
  process.exit(0);
}

const plugins = [
  new webpack.optimize.CommonsChunkPlugin({
    filename: filePathCommonChunk,
    minChunks: 2,
    name: 'common'
  })
];

if (isProduction) {
  // see http://lisperator.net/uglifyjs/compress
  plugins.push(new webpack.optimize.UglifyJsPlugin());
}

// most in the config need to be prefixed with `frontendPath` as webpack
// will set node's process cwd always to where the entry point is
const exportConfig = {
  entry: entryConfig,
  module: {
    rules: [
      {
        // do not transpile the listed libraries with babel as they do not need it
        test: /\.js$/,
        use: {
          loader: pathBabelLoader,
          options: babelConfig
        }
      }
    ]
  },
  plugins,
  output: {
    filename: `[name]/${values.output}.js`,
    path: projectRoot
  },

  resolveLoader: {
    modules: [
      `${frontendPath}/node_modules`,
      `${frontendPath}/commons`,
      `${frontendPath}`
    ]
  },
  resolve: {
    alias
  }
};


module.exports = exportConfig;
