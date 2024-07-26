const express = require('express');

const animalController = require('../controllers/animal');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

router.get('/', animalController.getAnimals);
router.get('/health', animalController.getHealth);
router.get('/stack-info', animalController.getStackInfo);
router.get('/animal/:id', animalController.getAnimal);
router.get('/admin/animals', isAuth, animalController.getAnimals);
router.post('/admin/add-animal', isAuth, animalController.postAnimal);
router.get('/admin/edit-animal/:id', isAuth, animalController.getAnimal);
router.put('/admin/edit-animal', isAuth, animalController.editAnimal);
router.delete('/admin/remove-animal', isAuth, animalController.removeAnimal);

module.exports = router;
