var mongoose = require('mongoose');
var CategorySchema = require('../schemas/category.js');//引入模式

var Category = mongoose.model('Category',CategorySchema);//生成模型

module.exports = Category;//导出构造函数