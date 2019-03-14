const express = require('express');
const router = express.Router(); // 创建路由容器
const userController = require('../controller/user/user');
const userUpdateController = require('../controller/user/userUpdate');

router.post('/login', userController.userLogin);
router.post('/sendEmail', userController.sendEmail);
router.post('/checkMail', userController.checkMail);
router.post('/checkUserExist', userController.checkUserExist);
router.post('/uploadAvatar', userController.uploadAvatar);
router.get('/checkToken', userController.checkToken);
router.get('/getUserDetails', userController.getUserDetails);

// 修改部分
router.post('/resetUserEmail', userUpdateController.resetUserEmail); // 修改邮箱
router.get('/verificatePwd', userUpdateController.verificatePwd); // 验证密码是否存在
router.post('/updateUserPwd', userUpdateController.updateUserPwd); // 修改密码
router.post('/verificateByEmail', userUpdateController.verificateByEmail); // 发送邮箱验证信息
router.post('/resetUserPwd', userUpdateController.resetUserPwd); // 重置密码
router.post('/updateUserInfo', userUpdateController.updateUserInfo);
router.post('/updateUserSchoolInfo', userUpdateController.updateUserSchoolInfo);

module.exports = router