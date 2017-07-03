var mongoose = require('mongoose');

//创建模式
var Schema = mongoose.Schema;

var ObjectId = Schema.Types.ObjectId;

var CategorySchema = new Schema({
	name: String,
	movies: [{type: ObjectId, ref: 'Movie'}],
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
CategorySchema.pre('save', function(next){
	//存储数据前调用此方法
	if(this.isNew){//数据是新加的
		this.meta.creatAt = this.meta.updateAt = Date.now();
	}else{//数据在数据库中已经有了，是再更新
		this.meta.updateAt = Date.now();
	}

	next();//存储流程继续走下去
});

//为模式添加静态方法（这些方法不会与数据库直接交互，只有经历了模型编译并实例化后才可以）
CategorySchema.statics = {

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
module.exports = CategorySchema;