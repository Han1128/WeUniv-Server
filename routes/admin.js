const express = require('express')
const router = express.Router();
const adminController = require('../controller/admin/admin');

router.post('/addTopicTags', adminController.addTopicTags);
router.post('/addUserByAdmin', adminController.addUserByAdmin);

module.exports = router;
