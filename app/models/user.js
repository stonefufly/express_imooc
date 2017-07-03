var mongoose = require('mongoose');
var UserSchema = require('../schemas/user.js');//引入模式

var User = mongoose.model('User',UserSchema);//生成模型

module.exports = User;//导出构造函数