const jwt = require('jsonwebtoken');

const { throwNewError, createNewError } = require('../utils/error');

const NOT_AUTHENTICATED = 'Not authenticated.';

module.exports = (req, res, next) => {
  try {
    const token = req.get('Authorization');
    if (!token) {
      // There is not Authorization header.
      throwNewError(NOT_AUTHENTICATED, 401);
    }
    const decodedToken = jwt.verify(token, 'behereandnow');
    if (!decodedToken) {
      // The token doesn't match.
      throwNewError(NOT_AUTHENTICATED, 401);
    }
    next();
  } catch (error) {
    let newError = error;
    if (!error.status) {
      newError = createNewError('Invalid token', 401);
    }
    next(newError);
  }
};
