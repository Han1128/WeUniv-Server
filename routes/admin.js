const express = require('express')
const router = express.Router();
const adminSearchController = require('../controller/admin/adminSearch');
const adminUpdateController = require('../controller/admin/adminUpdate');

const checkAdmin = require('../middleware/checkAdmin');

// 添加或更改
router.post('/addTopicTags', adminUpdateController.addTopicTags);
router.post('/addUserByAdmin', adminUpdateController.addUserByAdmin);
router.post('/updateUserByAdmin', adminUpdateController.updateUserByAdmin);
router.post('/addAdminSet', checkAdmin, adminUpdateController.addAdminSet);
router.post('/addToHomeSwiper', checkAdmin, adminUpdateController.addToHomeSwiper);
router.post('/addToHomeRecommend', checkAdmin, adminUpdateController.addToHomeRecommend);
router.post('/addToRecommendUser', checkAdmin, adminUpdateController.addToRecommendUser);
router.post('/resetPwdByAdmin', checkAdmin, adminUpdateController.resetPwdByAdmin); // 强制修改密码
router.post('/deleteComment', checkAdmin, adminUpdateController.deleteComment);
router.post('/deleteArticle', checkAdmin, adminUpdateController.deleteArticle);

// 查询
router.get('/getAdminInfo', checkAdmin, adminSearchController.getAdminInfo); // 增加中间件验证信息有效性
router.get('/getDataCount', checkAdmin, adminSearchController.getDataCount); // 查询系统数据统计
router.get('/getAdminMenuList', checkAdmin, adminSearchController.getAdminMenuList); // 增加中间件验证信息有效性
router.get('/getMostData', checkAdmin, adminSearchController.getMostData); // 图表数据获取
router.get('/getArticleStatistics', checkAdmin, adminSearchController.getArticleStatistics); // 图表数据获取
router.get('/getAdminTagsList', checkAdmin, adminSearchController.getAdminTagsList); // 获取话题列表
router.get('/getAdminCommentsList', checkAdmin, adminSearchController.getAdminCommentsList); // 获取评论列表

// qiniu
router.get('/updateQiniuAvatarUrl', checkAdmin, adminUpdateController.updateQiniuAvatarUrl);
router.get('/updateQiniuContentUrl', checkAdmin, adminUpdateController.updateQiniuContentUrl); // 查询系统数据统计
router.get('/updateQiniuBgUrl', checkAdmin, adminUpdateController.updateQiniuBgUrl);

module.exports = router;
