const express = require('express');
const { signup, login, protect } = require('../controllers/authController.js');
const {
   generateProject,
   generateNft,
   generateMultipleNfts,
   retrieveNfts,
   listProjects,
   getNft,
} = require('../controllers/productController.js');
const upload = require('../config/multerConfig.js');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.route('/');
router.route('/project').post(protect, upload.single('image'), generateProject).get(listProjects);
router.route('/nft').post(protect, upload.single('image'), generateNft).get(protect, retrieveNfts);
router.route('/nfts').post(
   protect,
   upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'csv', maxCount: 1 },
   ]),
   generateMultipleNfts
);
router.route('/details').get(protect, getNft);

module.exports = router;
