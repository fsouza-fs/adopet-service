/* eslint no-underscore-dangle: 0 */
const jwt = require('jsonwebtoken');

const {
  hashPassword,
  comparePassword,
  handleErrors,
} = require('../utils/utils');
const { throwNewError } = require('../utils/error');
const User = require('../models/user');

// Constants
const INVALID_EMAIL_PASSWORD = "Invalid value, email or password doesn't match any user in the website.";
const INVALID_EMAIL = 'Invalid value. The email already exists.';

/**
 * Post method to login into the admin part of the website.
 *
 * @param {*} res  The response object
 * @param {*} req  The request object
 * @param {*} next Function to go to the next middleware
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Search the database for the user based on the email.
    const user = await User.findOne({ email });
    if (!user) {
      // The user doesn't exist in the database,  return an error.
      throwNewError(INVALID_EMAIL_PASSWORD, 422);
    }

    // We have a user, get the password from the database.
    const hashedPassword = user.password;

    if (!comparePassword(password, hashedPassword)) {
      // The password doesn't match, return an error.
      throwNewError(INVALID_EMAIL_PASSWORD, 422);
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      'behereandnow',
      { expiresIn: '1hr' },
    );

    // Everything is validated, return a success message.
    res.status(200).json({
      message: 'Success login in',
      idToken: token,
      localId: user._id.toString(),
    });
  } catch (error) {
    const newError = handleErrors(error);
    next(newError);
  }
};

/**
 * Function to create a new user.
 *
 * @param {*} res  The response object
 * @param {*} req  The request object
 * @param {*} next Function to go to the next middleware
 */
exports.postCreateUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // We first need to hash the password.
    const hashedPassword = await hashPassword(password);

    // First try to see if the user being created already exists.
    if (await User.findOne({ email })) {
      throwNewError(INVALID_EMAIL, 422);
    }

    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({
      message: 'New user has been created successfuly.',
    });
  } catch (error) {
    const newError = handleErrors(error);
    next(newError);
  }
};
