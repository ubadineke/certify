const express = require('express');
const { signup, login, protect } = require('../controllers/authController.js');

const router = express.Router();

router.get('/ping', (req, res, next) => {
	console.log('go');
	res.status(204).end;
});
router.post('/signup', signup);
router.post('/login', login);

module.exports = router;
