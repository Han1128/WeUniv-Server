const config = require('../../config/index');
const userModel = require('../../models/user/user');
const articleModel = require('../../models/article/article');
const Qi = require('../../utils/qiniu');

class ArticleUpdate {
  // 文章提交 上传七牛云 保存链接 保存数据库
  async addArticleContent (req, res, next) {
    try {
      let articleKey = req.body.title + Date.parse(req.body.public_date) + '.html'; // 生成独一无二的文件名 最好还是用时间戳来保存
      let articleUrl = await Qi.uploadReTry(articleKey, req.body.content);
      let bgUrl = '';
      if (req.body.coverBg !== '') {
        let bgKey = req.body.title + Date.parse(req.body.public_date) + 'bg.png';
        let base64str = req.body.coverBg.replace('data:image/png;base64,', '');
        let buff = new Buffer(base64str, 'base64');
        bgUrl = await Qi.uploadReTry(bgKey, buff);
      }
      let coverBgArr = [];
      coverBgArr.push(bgUrl);
      const newArticle = new articleModel({
        title: req.body.title,
        type: req.body.type,
        content: articleUrl,
        text: req.body.text,
        status: 0,
        tag: req.body.tags,
        public_time: req.body.public_date,
        author: req.body.userId,
        coverBg: coverBgArr,
        viewsTime: req.body.viewsTime,
        isTop: req.body.isTop,
      })
      await newArticle.save();
      if (req.body.isTop) {
        // 设置置顶
        if (req.body.topId) {
          // 如果已经有置顶文章 将置顶文章setTop设置为false
          await articleModel.update({ 
            _id: req.body.topId 
          }, { 
            'isTop': false
          });
        }
        await userModel.update({ 
          _id: req.body.userId 
        }, { 
          $push: { article: newArticle._id }, 
          'topArticle': newArticle._id
        });
      }
      else {
        await userModel.update({ _id: req.body.userId }, { $push: { article: newArticle._id } });
      }
      res.json({
          success: true,
          message:'保存成功',
          data: {
            articleid: newArticle._id
          }
      })
    } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'用户信息更新失败',
          error
      })
    }
  }
  // 文章编辑
  async articleEdit(req, res, next) {
    try {
      // 先获取原有内容
      const oldResult = await articleModel.findOne({'_id': req.body.articleId});
      // 上传资源
      // 先上传图片
      let bgUrl = '';
      let coverBgArr = [];
      if (req.body.coverBg !== '' && req.body.coverBg !== oldResult.coverBg[0]) {
        // 上传背景图
        let bgKey = req.body.title + Date.parse(req.body.update_time) + 'bg.png';
        let base64str = req.body.coverBg.replace('data:image/png;base64,', '');
        let buff = new Buffer(base64str, 'base64');
        bgUrl = await Qi.uploadReTry(bgKey, buff);
        coverBgArr.push(bgUrl);
      }
      // 再上传文章
      let articleKey = req.body.title + Date.parse(req.body.update_time) + '.html'; // 生成独一无二的文件名 最好还是用时间戳来保存
      let articleUrl = await Qi.uploadReTry(articleKey, req.body.content);

      //再删除旧文章
      let contentArr = oldResult.content.split('/');
      let contentKey = contentArr[contentArr.length - 1];
      contentKey = decodeURI(contentKey);
      await Qi.deleteFromQiniu(contentKey);
      if (oldResult.coverBg[0] && req.body.coverBg !== oldResult.coverBg[0]) {
        // 再删除旧图
        let bgArr = oldResult.coverBg[0].split('/');
        let bgKey = bgArr[bgArr.length - 1];
        bgKey = decodeURI(bgKey);
        await Qi.deleteFromQiniu(bgKey);
      }
      // 一次更新多条
      await articleModel.update({
        '_id': req.body.articleId
      },{$set: {
        'title': req.body.title, 
        'content': articleUrl, 
        'text': req.body.text,
        'tag': req.body.tags, 
        'update_time': req.body.update_time,
        'coverBg': req.body.coverBg === oldResult.coverBg[0] ? req.body.coverBg : coverBgArr,
        'viewsTime': 1,
        'isTop': req.body.isTop
      }});
      if (req.body.isTop) {
        // 设置置顶
        if (req.body.topId) {
          // 如果已经有置顶文章 将置顶文章setTop设置为false
          await articleModel.update({ 
            _id: req.body.topId 
          }, { 
            'isTop': false
          });
        }
        await userModel.update({ 
          _id: req.body.userId 
        }, { 
          'topArticle': req.body.articleId
        });
      }
      else if (req.body.topId == req.body.articleId) {
        // 置顶文章设置为不置顶
        await userModel.update({ 
          _id: req.body.userId 
        }, { 
          'topArticle': ''
        });
      }
      res.json({
          success: true,
          message:'更新成功',
          data: {
            articleid: req.body.articleId
          }
      })
    } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'文章信息更新失败'
      })
    }
  }
  async articleDelete(req, res) {
    try {
      // 查询删除文章和背景
      const result = await articleModel.findOne({
        '_id': req.body.articleId
      });
      // 删除七牛云资源
      let contentArr = result.content.split('/');
      let contentKey = contentArr[contentArr.length - 1];
      contentKey = decodeURI(contentKey);
      await Qi.deleteFromQiniu(contentKey);
      if (result.coverBg[0]) {
        let bgArr = result.coverBg[0].split('/');
        let bgKey = bgArr[bgArr.length - 1];
        bgKey = decodeURI(bgKey);
        await Qi.deleteFromQiniu(bgKey);
      }
      // 删除用户表的数据
      await userModel.update({
        _id: result.author 
      }, { 
        $pull: {
          'article': result._id
        }
      });
      // 删除文章
      await articleModel.remove({'_id': result._id});
      res.json({
          success: true,
          message:'删除成功'
      })
    } catch (error) {
      console.log('error', error)
      res.json({
          success: false,
          message:'文章删除失败'
      })
    }
  }
  // 说说提交
  async addShortArticle(req, res, next) {
    try {
      let bgArr = []; // 存放图片集合
      let bgUrl = ''; // 临时存放上传url
      if (req.body.coverBg !== '') {
        for (let index = 0;index < req.body.coverBg.length; index++) {
          let bgKey = '文章图' + req.body.username + Date.parse(new Date()) + index + '.png';
          let base64str = req.body.coverBg[index].replace('data:image/png;base64,', '');
          let buff = new Buffer(base64str, 'base64');
          bgUrl = await Qi.uploadReTry(bgKey, buff);
          bgArr.push(bgUrl);
        }
      }
      const newArticle = new articleModel({
        title: '',
        type: 'short',
        content: req.body.content,
        status: 0,
        tag: '说说',
        public_time: new Date(),
        author: req.body.userId,
        coverBg: bgArr,
        viewsTime: 0,
        isTop: req.body.isTop,
      })
      await newArticle.save(); // 保存文章
      if (req.body.isTop) {
        // 设置置顶
        if (req.body.topId) {
          // 如果已经有置顶文章 将置顶文章setTop设置为false
          await articleModel.update({ 
            _id: req.body.topId 
          }, { 
            'isTop': false
          });
        }
        await userModel.update({ 
          _id: req.body.userId 
        }, { 
          $push: { article: newArticle._id }, 
          'topArticle': newArticle._id
        });
      }
      else {
        await userModel.update({ _id: req.body.userId }, { $push: { article: newArticle._id } });
      }
      res.json({
        success: true,
        message:'文章提交成功'
      })
    } catch (error) {
      console.log('error', error)
      res.json({
        success: false,
        message:'文章提交失败,请重试'
      })
    }
  }
}

module.exports = new ArticleUpdate();