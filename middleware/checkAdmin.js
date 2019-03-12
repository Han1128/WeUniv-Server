const userModel = require('../models/user/user')

module.exports = async ( req, res, next ) => {
  try {
    const adminResult = await userModel.findOne({
      _id: req.query.adminId
    });
    
    if (adminResult.userType === 'admin') {
      next()
    }
    else {
      res.status(403).end();
    }
  } catch (error) {
    console.log('error', error)
    res.json({
        success: false,
        message:'查询失败'
    })
  }
}