var mongoose = require('mongoose');
var CommentSchema = require('../schemas/comment.js');//引入模式

var Comment = mongoose.model('Comment',CommentSchema);//生成模型

module.exports = Comment;//导出构造函数