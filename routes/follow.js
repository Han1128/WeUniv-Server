const express = require('express')
const router = express.Router();
const followController = require('../controller/follow/follow');

router.post('/addFllowShip', followController.addFllowShip);
router.post('/removeFollowShip', followController.removeFollowShip);
router.get('/getFollowingList', followController.getFollowingList);
router.get('/getFollowerList', followController.getFollowerList);
router.get('/getCommonFollow', followController.getCommonFollow);
router.get('/getFollowArticle', followController.getFollowArticle);

module.exports = router;
