const { throwNewError } = require('../utils/error');
const { addAdoptedAnimalToList, handleErrors } = require('../utils/utils');
const Guardian = require('../models/guardian');
const Animal = require('../models/animal');

// Constants
const CAN_NOT_ADOPT = 'Sorry, it looks like you don\'t have the right profile to adopt this animal.';
const ANIMAL_NOT_EXIST = 'Sorry, it looks like the animal you are trying to adopt does not exist in our database.';

exports.postAdopt = async (req, res, next) => {
  try {
    const {
      identification,
      name,
      email,
      age,
      gender,
      wage,
      telephone,
      address,
    } = req.body;
    const petId = req.params.id;
    // We now would go make a request to the animal-service and retrieve
    // the information about this pet. For now it is dummy data.
    const animal = await Animal.findByPk(petId);

    if (!animal) {
      // The animal request to be adopted doesn't exist in the database,
      // so we return an error to the user.
      throwNewError(ANIMAL_NOT_EXIST, 422);
    }
    if (!animal.canAdopt(wage)) {
      // The user doesn't have the profile to adopt this animal, so return
      // an error explaining it.
      throwNewError(CAN_NOT_ADOPT, 422);
    }

    let guardian = await Guardian.findOne({ identification });
    if (!guardian) {
      guardian = new Guardian({
        identification,
        name,
        email,
        age,
        gender,
        wage,
        telephone,
        address,
      });
    }
    guardian.pets = addAdoptedAnimalToList(guardian, animal);
    await guardian.save();
    // Everything is validated, return a success message.
    res.status(200).json({
      message:
        'Your adoption has been requested. We will enter in contact with you soon.',
    });
  } catch (error) {
    const newError = handleErrors(error);
    next(newError);
  }
};
