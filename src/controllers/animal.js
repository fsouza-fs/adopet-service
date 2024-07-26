const { handleErrors } = require('../utils/utils');
const Animal = require('../models/animal');

/**
 * Get container hostname.
 *
 * @param {*} res  The response object
 * @param {*} req  The request object
 * @param {*} next Function to go to the next middleware
 */
exports.getStackInfo = async (req, res, next) => {
  try {
    const serviceIpAddress = process.env.NODE_ENV_IP;
    const siteIpAddress = req.header('x-server-address');

    console.log("------SITE IP-----")
    console.log(siteIpAddress);

    // Everything is validated, return a success message.
    res.status(200).json({
      message: 'Success retrieving ip address',
      siteIpAddress,
      serviceIpAddress,
    });
  } catch (error) {
    const newError = handleErrors(error);
    next(newError);
  }
};

/**
 * Get all the animals that exists to be adopted.
 *
 * @param {*} res  The response object
 * @param {*} req  The request object
 * @param {*} next Function to go to the next middleware
 */

exports.getHealth = async (req, res, next) => {
  try {
    // Everything is validated, return a success message.
    res.status(200).json({
      message: 'Service is healthy!',
    });
  } catch (error) {
    const newError = handleErrors(error);
    next(newError);
  }
};

exports.getAnimals = async (req, res, next) => {
  try {
    const animals = await Animal.findAll();
    // Everything is validated, return a success message.
    res.status(200).json({
      message: 'Success retrieving animals',
      animals,
    });
  } catch (error) {
    const newError = handleErrors(error);
    next(newError);
  }
};

/**
 * Get an specific animal.
 *
 * @param {*} res  The response object
 * @param {*} req  The request object
 * @param {*} next Function to go to the next middleware
 */
exports.getAnimal = async (req, res, next) => {
  try {
    const response = {};
    const { id } = req.params;
    const animal = await Animal.findByPk(id);

    if (animal) {
      response.message = 'Success retrieving animal.';
      response.animal = animal;
    } else {
      response.message = 'The animals requested does not exist in the database.';
    }
    // Everything is validated, return a success message.
    res.status(200).json(response);
  } catch (error) {
    const newError = handleErrors(error);
    next(newError);
  }
};

/**
 * Add a new animal.
 *
 * @param {*} res  The response object
 * @param {*} req  The request object
 * @param {*} next Function to go to the next middleware
 */
exports.postAnimal = async (req, res, next) => {
  try {
    const {
      name,
      age,
      breed,
      specie,
      imageUrl,
      gender,
      vaccinated,
      description,
      adopted,
    } = req.body;

    await Animal.create({
      name,
      age,
      breed,
      specie,
      imageUrl,
      gender,
      vaccinated,
      description,
      adopted,
    });
    // Everything is validated, return a success message.
    res.status(201).json({
      message: 'The new animal has been added succesfully.',
    });
  } catch (error) {
    const newError = handleErrors(error);
    next(newError);
  }
};

/**
 * Edit an existing animal.
 *
 * @param {*} res  The response object
 * @param {*} req  The request object
 * @param {*} next Function to go to the next middleware
 */
exports.editAnimal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      age,
      breed,
      specie,
      imageUrl,
      gender,
      vaccinated,
      description,
      adopted,
    } = req.body;

    const animal = await Animal.findByPk(id);

    if (animal) {
      animal.name = name;
      animal.age = age;
      animal.breed = breed;
      animal.specie = specie;
      animal.imageUrl = imageUrl;
      animal.gender = gender;
      animal.vaccinated = vaccinated;
      animal.description = description;
      animal.adopted = adopted;
    }

    await animal.save();
    // Everything is validated, return a success message.
    res.status(201).json({
      message: 'The animal information has been edited succesfully.',
    });
  } catch (error) {
    const newError = handleErrors(error);
    next(newError);
  }
};

exports.removeAnimal = async (req, res, next) => {
  try {
    const response = {};
    const { id } = req.body;
    const animal = await Animal.findByPk(id);
    if (animal) {
      await animal.destroy();
      response.message = 'The animal has been removed succesfully.';
    } else {
      response.message = 'There has been an error finding the animal and it has not been removed.';
    }

    res.status(200).json(response);
  } catch (error) {
    const newError = handleErrors(error);
    next(newError);
  }
};
