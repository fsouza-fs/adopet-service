const { model, Schema } = require('mongoose');

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please, provide a name'],
  },
  email: {
    type: String,
    validate: {
      validator: (value) => /^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/.test(value),
      message: 'The email entered is not a valid email.',
    },
    required: [true, 'Please, provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please, provide a valid password'],
  },
});

module.exports = model('User', userSchema);
