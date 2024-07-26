const { model, Schema } = require('mongoose');

const guardianSchema = new Schema({
  identification: {
    type: String,
    required: [
      true,
      'An Identification document is necessary to adopt an animal.',
    ],
  },
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
  age: {
    type: Number,
    required: true,
    min: [18, 'You must be 18 or older to adopt an animal.'],
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female'],
  },
  wage: {
    type: Number,
    required: true,
  },
  telephone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  pets: {
    adopted: [
      {
        petIdentification: {
          type: String,
          required: true,
        },
        specie: {
          type: String,
          required: true,
        },
      },
    ],
  },
});

module.exports = model('Guardian', guardianSchema);
