const express = require('express');
const { signup, login, protect } = require('../controllers/authController.js');
const {
   generateProject,
   createSingleNft,
   generateMultipleNfts,
   getProjectDetails,
   getUserProjects,
   getAllProjects,
   getNft,
   getByScan,
} = require('../controllers/productController.js');
const upload = require('../config/multerConfig.js');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/', getAllProjects);
router
   .route('/project')
   .post(protect, upload.single('image'), generateProject)
   .get(protect, getUserProjects);
router.route('/nft').post(protect, upload.single('image'), createSingleNft);
router.route('/scan').get(getByScan);
router
   .route('/nfts')
   .post(
      protect,
      upload.fields([
         { name: 'image', maxCount: 1 },
         { name: 'csv', maxCount: 1 },
      ]),
      generateMultipleNfts
   )
   .get(protect, getProjectDetails);
router.route('/details').get(protect, getNft);

module.exports = router;
