const express = require('express')
const router = express.Router();
const followController = require('../controller/follow/follow');

router.post('/addFllowShip', followController.addFllowShip);
router.post('/removeFollowShip', followController.removeFollowShip);

module.exports = router;
