const express = require('express');
const router = express.Router(); // 创建路由容器
const articleController = require('../controller/article/article');

router.post('/addArticleContent', articleController.addArticleContent); // 长文添加
router.post('/addShortArticle', articleController.addShortArticle); // 短文添加
router.post('/articleEdit', articleController.articleEdit); // 文章编辑
router.post('/articleDelete', articleController.articleDelete); // 文章删除
router.get('/getUserArticles', articleController.getUserArticles);
router.get('/getDesignArticle', articleController.getDesignArticle); // 获取特定文章 单个查询
router.get('/getHomePageArticle', articleController.getHomePageArticle); // 首页热门文章
router.get('/getArticleByTag', articleController.getArticleByTag); // 通过标签筛选文章
router.get('/getNewestArticle', articleController.getNewestArticle); // 通过时间间隔筛选文章

router.post('/updateNum', articleController.updateNum); // 通过时间间隔筛选文章

module.exports = router