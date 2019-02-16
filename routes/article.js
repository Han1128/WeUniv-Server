const express = require('express');
const router = express.Router(); // 创建路由容器
const articleController = require('../controller/article/article');

router.post('/addArticleContent', articleController.addArticleContent);
router.post('/uploadArticlePic', articleController.uploadArticlePic);
router.get('/getArticleInfo', articleController.getArticleInfo);

module.exports = router