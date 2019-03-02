const express = require('express');
const router = express.Router(); // 创建路由容器
const searchController = require('../controller/search/search');

router.post('/blurrySearch', searchController.blurrySearch); // 长文添加
router.get('/getHotArticleList', searchController.getHotArticleList); // 热文搜索
router.get('/getRecommendArticle', searchController.getRecommendArticle); // 相关推荐

module.exports = router