const webpack = require('webpack');
const config = require('../configs/webpack.config');
const log = require('../utils/log')('build');

const isWatchMode = process.argv[(process.argv.length - 1)] === '--watch';
const handler = (err, stats) => {
  if (err) {
    log.error(err.stack || err);
    if (err.details) {
      log.error(err.details);
    }

    return;
  }

  if (stats.hasErrors()) {
    const info = stats.toJson();

    log.error(info.errors);
  }

  log.info(stats.toString({
    chunks: false,
    colors: true
  }));
};

if (Object.keys(config.entry).length > 0) {
  const compiler = webpack(config);
  if (isWatchMode) {
    compiler.watch({
      aggregateTimeout: 300,
      ignored: /node_modules/
    }, handler);
  } else {
    compiler.run(handler);
  }
} else {
  log.joke('Have you started the project? Because the build did not match any files');
}
