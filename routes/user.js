const express = require('express');
const router = express.Router(); // 创建路由容器
const userController = require('../controller/user/user');

router.post('/login', userController.userLogin);
router.post('/sendEmail', userController.sendEmail);
router.post('/checkMail', userController.checkMail);
router.post('/checkUserExist', userController.checkUserExist);
router.post('/uploadAvatar', userController.uploadAvatar);
router.get('/checkToken', userController.checkToken);
router.get('/getUserDetails', userController.getUserDetails);

module.exports = router