const path = require(`path`)

const absolutePathToRoot = path.resolve(process.cwd());
const { paths } = require(`${absolutePathToRoot}/package.json`);

module.exports = {
  WEBPACK_IS_PRODUCTION: process.env.NODE_ENV === `production`,
  WEBPACK_ABSOLUTE_PATH_TO_PROJECT_ROOT: JSON.stringify(
    path.resolve(absolutePathToRoot, paths.root)
  )
}
