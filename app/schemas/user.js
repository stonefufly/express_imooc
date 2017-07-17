var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');//为密码存储设计的算法。现在版本用bcryptjs替代bcrypt ，参考地址 http://npm.taobao.org/package/bcryptjs
var SALT_WORK_FACTOR = 10;//密码加的盐的计算的强度

//创建模式
var Schema = mongoose.Schema;

function validatePresenceOf(value){
	return value && value.length;
}

var UserSchema = new Schema({
	name: {
		unique: true,
		type: String
	},
	password: String,
	email: String,
	role: {
		type: Number,
		default: 0 //0是普通用户权限
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
UserSchema.pre('save', function(next){
	//存储数据前调用此方法
	if(this.isNew){//数据是新加的
		this.meta.creatAt = this.meta.updateAt = Date.now();
	}else{//数据在数据库中已经有了，是再更新
		this.meta.updateAt = Date.now();
	}

	var user = this;//user就是当前的对象

	//先生成一个随机的密码的盐，
	//第一个参数是计算的强度
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){

		if(err){//如果有错误就将err带入到下一个流程里面去
			return next(err);
		}
		//salt是密码要加的盐

		//然后将密码和盐混合进行加密，就拿到最终要存储的密码
		bcrypt.hash(user.password, salt, function(err, hash){
			if(err){
				return next(err);
			}
			//hash是密码混合盐之后hash算法加密后的新的hash值
			user.password = hash;
			next();//进入下一步，存储流程继续走下去
		});
	});
});

//静态方法，模型就可以调用,实例方法，对象实例才能调用

//为模式添加实例方法
UserSchema.methods = {

	comparePassword: function(_password, cb){
		
		//对比传递过来的密码加盐加密后和数据库中的密码是否相同
		bcrypt.compare(_password, this.password, function(err, isMatch){
			if(err){
				//如果有报错就，把错误传递到回调cb中
				return cb(err);
			}

			cb(null, isMatch);
		});
	}
}

//为模式添加静态方法（这些方法不会与数据库直接交互，只有经历了模型编译并实例化后才可以）
UserSchema.statics = {

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
module.exports = UserSchema;