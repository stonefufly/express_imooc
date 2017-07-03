var mongoose = require('mongoose');

//创建模式
var Schema = mongoose.Schema;

var ObjectId = Schema.Types.ObjectId;

function validatePresenceOf(value){
	return value && value.length;
}

var MovieSchema = new Schema({
	doctor: {type: String,validate: [validatePresenceOf,'a doctor is required']},//提交表单时如果字符串不存在则验证失败，movie就不会被保存，movie.save(function (err){中的err会是true并且是'a doctor is required'信息
	title: String,
	language: String,
	country: String,
	summary: String,//简介
	flash: String,//片源地址
	poster: String,//海报地址
	year: Number,
	pv: {//访问量
		type: Number,
		default: 0
	},
	category: {
		type: ObjectId,
		ref: 'Category'
	},
	meta: {
		creatAt: {
			type: Date,
			default: Date.now()
		},
		updateAt: {
			type: Date,
			default: Date.now()
		}
	}
});

//为模式添加方法
MovieSchema.pre('save', function(next){
	//存储数据前调用此方法
	if(this.isNew){//数据是新加的
		this.meta.creatAt = this.meta.updateAt = Date.now();
	}else{//数据在数据库中已经有了，是再更新
		this.meta.updateAt = Date.now();
	}

	next();//存储流程继续走下去
});

//为模式添加静态方法（这些方法不会与数据库直接交互，只有经历了模型编译并实例化后才可以）
MovieSchema.statics = {

	fetch: function(cb){

		return this
		.find({})
		.sort('meta.updateAt')//查询所有记录，以updateAt排序
		.exec(cb);//执行回调方法
	},
	findById: function(id, cb){

		return this
		.findOne({_id: id})
		.exec(cb);//执行回调方法
	}
}

//将模式导出
module.exports = MovieSchema;