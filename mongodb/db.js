const mongoose = require('mongoose');
const config = require('../config/index')
// const chalk = require('chalk');

// 数据库连接,指向数据库地址
const db_connect = config.url;
mongoose.connect(db_connect);

// 连接成功
mongoose.connection.on('connected', () => {
  console.log(`mongoose connection open to ${db_connect}`);
})

//连接失败
mongoose.connection.on('error', () => {
  console.error('mongoose error !');
})

//连接断开终端显示消息
mongoose.connection.on('disconnected', () => {
  console.error('mongoose disconnected !');
})

module.exports = mongoose