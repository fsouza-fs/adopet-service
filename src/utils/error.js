/**
 * Creates a new error object, populate it and throws an error.
 *
 * @param {*} message     The message to be send.
 * @param {*} statusError The status error.
 * @param {*} moreInfo    Other important information to the user.
 */
exports.createNewError = (message, statusError, moreInfo) => {
  const error = new Error(message);
  error.status = statusError;
  error.info = moreInfo;
  return error;
};

/**
 * Throws a new error.
 *
 * @param {*} message     The message to be send.
 * @param {*} statusError The status error.
 * @param {*} moreInfo    Other important information to the user.
 */
exports.throwNewError = (message, statusError, moreInfo) => {
  const error = this.createNewError(message, statusError, moreInfo);
  throw error;
};
