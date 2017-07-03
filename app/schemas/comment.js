/*评论*/

var mongoose = require('mongoose');

//创建模式
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;//获取objectId类型（数据库里的主键 _id，每一个Schema都默认有这个_id属性）,此类型通过复杂方式生成，很难重复。mongoose默认生成的主键类型就是ObjecId

function validatePresenceOf(value){
	return value && value.length;
}

var CommentSchema = new Schema({
	movie: {//评论的电影
		type: ObjectId,//存关联电影对象的ID
		ref: 'Movie'//指向数据库里关联的movie模型。用关联的ObjectId找到被引用的Schema文档，用此文档的内容(可选字段)替换掉原来的Schema文档的此引用字段的内容，如同将被引用Schema文档内嵌到引用Schema文档中
	},
	from: {//评论的评论者
		type: ObjectId,
		ref: 'User'
	},
	reply: [{
		from: {type: ObjectId,ref: 'User'},//回复者
		to: {type: ObjectId,ref: 'User'},//被回复的评论者
		content: String
	}],
	content: String,
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
CommentSchema.pre('save', function(next){
	//存储数据前调用此方法
	if(this.isNew){//数据是新加的
		this.meta.creatAt = this.meta.updateAt = Date.now();
	}else{//数据在数据库中已经有了，是再更新
		this.meta.updateAt = Date.now();
	}

	next();//存储流程继续走下去
});

//为模式添加静态方法（这些方法不会与数据库直接交互，只有经历了模型编译并实例化后才可以）
CommentSchema.statics = {

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
module.exports = CommentSchema;