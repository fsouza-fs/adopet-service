const express = require('express');

const guardianController = require('../controllers/guardian');

const router = express.Router();

router.post('/adopt/:id', guardianController.postAdopt);

module.exports = router;
