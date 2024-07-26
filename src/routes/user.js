const express = require('express');

const userController = require('../controllers/auth');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

router.post('/login', userController.login);
router.post('/create-user', isAuth, userController.postCreateUser);

module.exports = router;
