const express = require('express');
const router = express.Router(); // 创建路由容器
const articleController = require('../controller/article/article');

router.post('/addArticleContent', articleController.addArticleContent); // 长文添加
router.post('/addShortArticle', articleController.addShortArticle); // 短文添加
router.get('/getUserArticles', articleController.getUserArticles);
router.get('/getDesignArticle', articleController.getDesignArticle); // 获取特定文章 单个查询

module.exports = router