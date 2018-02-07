/**
 * @param {string} errorName
 * @param {string} errorType
 * @param {function} [callback] - called the error constructor and
 *  can be used to modify the error's config
 * @return {Error}
 */
module.exports.getCustomError = function (errorName, errorType, callback) {
  /**
   * @param {object|Error} config || error
   * @param {number} [config.code]
   * @param {string} [config.message]
   * @param {string} [config.title]
   * @param {string} [config.stack]
   */
  function SiemensCustomError(config = {}) {
    if (typeof callback !== `undefined`) {
      callback(config)
    }

    Object.assign(this, {
      name: errorName,
      stack: (new Error()).stack,
      type: errorType
    }, config)
  }

  SiemensCustomError.prototype = Object.create(Error.prototype)
  SiemensCustomError.prototype.constructor = SiemensCustomError

  return SiemensCustomError
}