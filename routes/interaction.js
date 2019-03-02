const express = require('express');
const router = express.Router(); // 创建路由容器
const interActionController = require('../controller/interaction/interaction');

router.post('/addLike', interActionController.addLikeToList);
router.post('/addCollect', interActionController.addCollectToList);
router.post('/addCommentLike', interActionController.addCommentLike);
router.post('/postComment', interActionController.postComment);
router.post('/postReplyComment', interActionController.postReplyComment);
router.get('/getUserLike', interActionController.getUserLike);
router.get('/getUserCollect', interActionController.getUserCollect);
router.get('/getUserComment', interActionController.getUserComment);
router.get('/getLikeArticle', interActionController.getLikeArticle); // 获取用户点赞和评论文章列表

module.exports = router;