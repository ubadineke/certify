const express = require('express');
const { signup, login, protect } = require('../controllers/authController.js');
const {
	generateProject,
	generateNft,
	retrieveNft,
	listProjects,
} = require('../controllers/productController.js');
const upload = require('../config/multerConfig.js');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.route('/');
router
	.route('/project')
	.post(protect, upload.single('image'), generateProject)
	.get(protect, listProjects);
router.route('/nft').post(protect, upload.single('image'), generateNft).get(protect, retrieveNft);

module.exports = router;
