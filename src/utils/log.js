const BuildError = require('./error').getCustomError('BuildError', 'BuildError');
const { name } = require('../package.json');

const emojis = {
  error: ['🙈', '🙀', '😱', '😢', '😣', '😥', '😦', '😧', '😨', '😩', '😪', '😫', '😭', '😮', '😯'],
  success: ['😻', '😀', '😁', '😂', '😃', '😄', '😇', '😉', '😊', '😋', '😍', '😎', '😬', '😏', '🙏']
};

function getRandomEntryFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/* eslint-disable no-console */
module.exports = function log(taskname = '') {
  const API = {
    error(message, notify = true) {
      const emoji = getRandomEntryFromArray(emojis.error);
      const errorMessage = `[${name}:${taskname} ERROR]\n${message}`;

      if (process.env.NODE_ENV !== 'production' && notify === true) {
        const notifier = require('node-notifier');

        notifier.notify({
          message: errorMessage,
          sound: true,
          title: `${emoji} Build Error: ${taskname}`
        });
      }

      console.error('\x1b[31m%s\x1b[0m', errorMessage);
    },

    /**
     * @param {string|Error} messageOrError
     * @param {string} [additionalMessage]
     */
    errorAndThrowError(messageOrError, additionalMessage = '') {
      let errorInstance = messageOrError;

      if (typeof messageOrError === 'string') {
        errorInstance = new BuildError({
          messageOrError
        });
      }

      let errorMessage = errorInstance.message || 'Error';

      if (additionalMessage) {
        errorMessage += additionalMessage;
      }

      API.error(`${errorMessage}
${errorInstance.stack}`);

      if (process.env.NODE_ENV === 'production') {
        throw errorInstance;
      }
    },

    warning(message) {
      console.log('\x1b[33m%s\x1b[0m', `[${name}:${taskname} WARNING] ${message}`);
    },

    info(message) {
      console.log('\x1b[33m%s\x1b[0m', `[${name}:${taskname} INFO] ${message}`);
    },

    joke(joke) {
      console.info('\x1b[40m%s\x1b[0m', [
        getRandomEntryFromArray(emojis.success),
        joke,
        getRandomEntryFromArray(emojis.success)
      ].join(' *******'));
    },

    success(message) {
      console.log('\x1b[32m%s\x1b[0m', `[${name}:${taskname} SUCCESS] ${message}`);
    }
  };

  return API;
};
/* eslint-enable no-console */
