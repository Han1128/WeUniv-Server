const express = require('express');
const router = express.Router(); // 创建路由容器
const articleSearchController = require('../controller/article/articleSearch');
const articleUpdateController = require('../controller/article/articleUpdate');


router.post('/addArticleContent', articleUpdateController.addArticleContent); // 长文添加
router.post('/addShortArticle', articleUpdateController.addShortArticle); // 短文添加
router.post('/articleEdit', articleUpdateController.articleEdit); // 文章编辑
router.post('/articleDelete', articleUpdateController.articleDelete); // 文章删除

// 文章查询
router.get('/getUserArticles', articleSearchController.getUserArticles);
router.get('/getUserGallery', articleSearchController.getUserGallery);
router.get('/getArticleContent', articleSearchController.getArticleContent);
router.get('/getDesignArticle', articleSearchController.getDesignArticle); // 获取特定文章 单个查询
router.get('/getNewestArticle', articleSearchController.getNewestArticle); // 通过时间间隔筛选文章
router.get('/getArticleByRange', articleSearchController.getArticleByRange); // 通过时间间隔筛选文章
router.get('/getArticleByTag', articleSearchController.getArticleByTag); // 通过标签筛选文章
router.get('/getHomePageDetails', articleSearchController.getHomePageDetails); // 首页查询一次性查清
router.get('/getHotTalkArticle', articleSearchController.getHotTalkArticle); // 首页查询一次性查清
// router.get('/getHomeSwiperArticle', articleSearchController.getHomeSwiperArticle); // 查询首页轮播图


module.exports = router