var mongoose = require('mongoose');
var MovieSchema = require('../schemas/movie.js');//引入模式

var Movie = mongoose.model('Movie',MovieSchema);//生成模型

module.exports = Movie;//导出构造函数