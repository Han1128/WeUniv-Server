const express = require('express');
const router = express.Router(); // 创建路由容器
const interUpdateController = require('../controller/interaction/interactionUpdate');
const interSearchController = require('../controller/interaction/interactionSearch');

router.post('/addLike', interUpdateController.addLikeToList);
router.post('/addCollect', interUpdateController.addCollectToList);
router.post('/addCommentLike', interUpdateController.addCommentLike);
router.post('/postComment', interUpdateController.postComment);
router.post('/postReplyComment', interUpdateController.postReplyComment);

// 查询交互
router.get('/getUserLike', interSearchController.getUserLike);
router.get('/getUserCollect', interSearchController.getUserCollect);
router.get('/getUserComment', interSearchController.getUserComment);
router.get('/getLikeArticle', interSearchController.getLikeArticle); // 获取用户点赞和评论文章列表

module.exports = router;