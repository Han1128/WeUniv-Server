const express = require('express');
const router = express.Router(); // 创建路由容器
const userController = require('../controller/user/user');

router.post('/login', userController.userLogin);
router.post('/register', userController.userRegister);
router.get('/checkMail', userController.checkMail);
router.post('/checkUserExist', userController.checkUserExist);
// router.post('/accesstoken', userController.accessToken);

module.exports = router