const express = require('express');
const router = express.Router(); // 创建路由容器
const messageController = require('../controller/message/message');

router.get('/getLikeMsg', messageController.getLikeMsg);
router.get('/getCollectMsg', messageController.getCollectMsg);
router.get('/getCommentMsg', messageController.getCommentMsg);
router.get('/getUnReadMsg', messageController.getUnReadMsg);
router.get('/getMessageCount', messageController.getMessageCount);

module.exports = router;