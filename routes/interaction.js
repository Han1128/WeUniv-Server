const express = require('express');
const router = express.Router(); // 创建路由容器
const interActionController = require('../controller/interaction/interaction');

router.post('/addLike', interActionController.addLikeToList);
router.post('/addCollect', interActionController.addCollectToList);
router.post('/addCommentLike', interActionController.addCommentLike);
router.post('/postComment', interActionController.postComment);
router.post('/postReplyComment', interActionController.postReplyComment);

module.exports = router;