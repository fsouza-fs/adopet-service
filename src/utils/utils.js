const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const User = require('../models/user');
const Animal = require('../models/animal');
const Guardian = require('../models/guardian');

const { createNewError } = require('./error.js');

const pgEndpoint = process.env.PG_ENDPOINT;
const dbUser = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;

const pgClient = new Client({
  host: pgEndpoint,
  user: dbUser,
  password: dbPassword,
  database: 'mydatabase',
});

const sampleGuardians = [
  {
    identification: '123456789',
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    gender: 'Male',
    wage: 3000,
    telephone: '123-456-7890',
    address: '123 Main St',
    pets: { adopted: [] },
  },
];

const sampleAnimals = [
  {
    name: 'Buddy',
    age: 2,
    breed: 'Golden Retriever',
    specie: 'dog',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Goldensondika.jpg/1200px-Goldensondika.jpg',
    gender: 'male',
    vaccinated: true,
    description: 'Friendly and playful',
    adopted: false,
  },
  {
    name: 'Whiskers',
    age: 3,
    breed: 'Siamese',
    specie: 'cat',
    imageUrl: 'https://www.metlifepetinsurance.com/content/dam/metlifecom/us/metlifepetinsurance/the-siamese-cat-min.webp',
    gender: 'female',
    vaccinated: true,
    description: 'Quiet and affectionate',
    adopted: false,
  },
];

/**
 * Hashes a given password.
 *
 * @param {*} password The password to be hashed.
 */
exports.hashPassword = async (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

/**
 * Compare a password and a hashed password (from DB) to see
 * whether they match or not.
 *
 * @param {*} password       The password posted.
 * @param {*} hashedPassword The password from the database.
 */
// eslint-disable-next-line max-len
exports.comparePassword = (password, hashedPassword) => bcrypt.compareSync(password, hashedPassword);

/**
 * Add a new animal to a guardian list of animals adopted.
 *
 * @param {*} guardian  The guardian who is adopting.
 * @param {*} animal    The animal which is being adopted.
 */
exports.addAdoptedAnimalToList = (guardian, animal) => {
  let pets = {};
  const newAnimal = {
    petIdentification: animal.id,
    specie: animal.specie,
  };

  if (guardian.isNew) {
    // If we don't have a pets object in the guardian, it means it is
    // the first time he/she is adopting.
    pets.adopted = [newAnimal];
  } else {
    // Otherwise, just copy the list of pets already adopted and add the
    // new one.
    guardian.pets.adopted.push(newAnimal);
    pets = guardian.pets;
  }

  return pets;
};

/**
 * Handle any possible validation errors from mongoose.
 *
 * @param {*} error The error being passed.
 */
exports.handleValidationErrors = (error) => {
  if (error.name === 'ValidationError') {
    const errorMessage = 'A validation error has occurred, see the details below for more information.';
    const status = 422;
    const info = {};

    Object.keys(error.errors).forEach((key) => {
      info[key] = error.errors[key].message;
    });
    return createNewError(errorMessage, status, info);
  }
  return null;
};

/**
 * Throws a new error.
 *
 * @param {*} error  The error got in the catch.
 */
exports.handleErrors = (error) => {
  let updatedError = error;
  const newError = this.handleValidationErrors(error);
  if (newError) {
    updatedError = newError;
  } else {
    if (!updatedError.status) {
      // We don't have a status, so this is a server error.
      // Pass the 500 error.
      updatedError.status = 500;
    }
    updatedError = error;
  }
  return updatedError;
};

exports.createAdminUser = async () => {
  const user = await User.find({ email: 'admin@admin.com' });
  if (!user.length) {
    const hashedPassword = await this.hashPassword('admin');
    const admin = new User({
      name: 'administrator',
      email: 'admin@admin.com',
      password: hashedPassword,
    });
    await admin.save();
  }
};

exports.populatePostgres = async () => {
  try {
    await pgClient.connect();

    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS Animals (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INT NOT NULL,
        breed VARCHAR(255) NOT NULL,
        specie VARCHAR(50) NOT NULL,
        imageUrl VARCHAR(255) NOT NULL,
        gender VARCHAR(50) NOT NULL,
        vaccinated BOOLEAN NOT NULL,
        description TEXT NOT NULL,
        adopted BOOLEAN NOT NULL DEFAULT FALSE
      );
    `);

    for (const animal of sampleAnimals) {
      const res = await pgClient.query('SELECT * FROM Animals WHERE name = $1 AND breed = $2 AND specie = $3', [animal.name, animal.breed, animal.specie]);
      if (res.rows.length === 0) {
        await pgClient.query(`
          INSERT INTO Animals (name, age, breed, specie, imageUrl, gender, vaccinated, description, adopted)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `, [animal.name, animal.age, animal.breed, animal.specie, animal.imageUrl, animal.gender, animal.vaccinated, animal.description, animal.adopted]);
      }
    }

    console.log('PostgreSQL database populated successfully!');
  } catch (error) {
    console.error('Error populating PostgreSQL database:', error);
  } finally {
    await pgClient.end();
  }
};

exports.populateMongo = async () => {
  try {
    for (const guardian of sampleGuardians) {
      const existingGuardian = await Guardian.findOne({ identification: guardian.identification });
      if (!existingGuardian) {
        await Guardian.create(guardian);
      }
    }

    console.log('MongoDB database populated successfully!');
  } catch (error) {
    console.error('Error populating MongoDB database:', error);
  }
};