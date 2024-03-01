const express = require('express');
const { protect } = require('../controllers/authController.js');
const {
	generateProject,
	generateNft,
	retrieveNfts,
	listProjects,
	listAllProjects,
	getNft,
} = require('../controllers/productController.js');
const upload = require('../config/multerConfig.js');
const router = express.Router();

router.route('/').get(protect, listAllProjects);
router
	.route('/project')
	.post(protect, upload.single('image'), generateProject)
	.get(protect, listProjects);
router.route('/nfts').post(protect, upload.single('image'), generateNft).get(protect, retrieveNfts);
router.route('/details').get(protect, getNft);

module.exports = router;
