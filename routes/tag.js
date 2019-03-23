const express = require('express')
const router = express.Router();
const tagController = require('../controller/tag/tag');

router.get('/getHotTags', tagController.getHotTags); // 热门标签获取
router.get('/getAllTags', tagController.getAllTags); // 所有标签获取
router.get('/getUserTags', tagController.getUserTags);
router.get('/getTagInfo', tagController.getTagInfo);
router.post('/addFollowTag', tagController.addFollowTag);
router.post('/removeFollowTag', tagController.removeFollowTag);

module.exports = router;