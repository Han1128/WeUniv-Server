const express = require('express')
const router = express.Router();
const adminController = require('../controller/admin/admin');

const checkAdmin = require('../middleware/checkAdmin');

router.post('/addTopicTags', adminController.addTopicTags);
router.post('/addUserByAdmin', adminController.addUserByAdmin);
router.get('/getAdminInfo', checkAdmin, adminController.getAdminInfo); // 增加中间件验证信息有效性
router.get('/getDataCount', checkAdmin, adminController.getDataCount); // 查询系统数据统计

module.exports = router;
