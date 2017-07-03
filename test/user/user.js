var mongoose = require('mongoose');
var fs = require('fs');
var crypto = require('crypto');//随机字符串生成
var bcrypt = require('bcryptjs');//对密码加密
var should = require('should');
var assert = require('assert');//断言模块

var app = require('../../app');//引入入口文件
//var User = require('../../app/models/user');//获取user模型
var User = mongoose.model('User');//获取user模型

//获取随机字符串
function getRandomString(len){
	if(!len) len = 16;//len长度没有传的话，长度默认是16

	return crypto.randomBytes(Math.ceil(len / 2)).toString('hex');
}

/*检测性能快慢*/
console.time('for-loop-1');//启动定时器
console.timeEnd('for-loop-1');//停止定时器

var user;

//测试用例

//描述一个单元测试开始
describe('<Unit Test', function(){//一个测试模块里可以有多个子测试模块，所以可以分组测试

	//声明测试用户模型的测试模块
	describe('Model User:', function(){

		before(function(done){//测试用例开始之前做的事情，比如预定义一些开始变量等等。done是个函数，测试是从done这个函数调用的时候开始的

			user = {
				name: getRandomString(),
				password: 'password'
			}

			done();//开始测试
		});

		//声明一个测试模块，测试用户名在数据库中不存在
		describe('Before Method save:', function(){

			//一个it代表一个测试的用例单元，用于测试某一个类型的功能点
			it('should begin without test user', function(done){//user在数据库中不存在
				User.find({name: user.name}, function(err, users){
					users.should.have.length(0);//希望查询出的用户数组长度为0

					done();//异步测试中使用done()回调方法表示测试完成
				});
			});
		});

		//声明一个测试模块，测试user保存
		describe('User save:', function(){

			//用于测试user保存时不会出错
			it('should save without problems', function(done){
				
				var _user = new User(user);

				_user.save(function(err){

					should.not.exist(err);//希望err不存在

					_user.remove(function(err){//测试完user保存流程后要删除测试的数据，以免垃圾数据影响业务
						should.not.exist(err);
						done();
					});
				});
			});

			//用于测试user保存时密码的生成没有问题
			it('should password be hashed correctly', function(done){
				
				var password = user.password;
				var _user = new User(user);

				_user.save(function(err){

					should.not.exist(err);//希望err不存在

					_user.password.should.not.have.length(0);//希望保存user前，生成的密码长度不为0

					bcrypt.compare(password, _user.password, function(err, isMatch){

						should.not.exist(err);
						isMatch.should.equal(true);//希望isMatch为true，也就是希望密码是匹配的

						_user.remove(function(err){
							should.not.exist(err);
							done();
						});
					});
				});
			});

			//用于测试user创建时是否权限为默认的0
			it('should have default role 0', function(done){
				
				var _user = new User(user);

				_user.save(function(err){

					_user.role.should.equal(0);//希望user创建时权限是默认的0

					_user.remove(function(err){
						done();
					});
				});
			});

			//用于测试存储一个已经存在的user会报错
			it('should fail to save an existing user', function(done){
				
				var _user1 = new User(user);

				_user1.save(function(err){
					should.not.exist(err);

					var _user2 = new User(user);

					_user2.save(function(err){

						should.exist(err);//希望err存在，希望会出错

						_user1.remove(function(err){
							if(!err){
								_user2.remove(function(err){
									done();
								});
							}
						});
					});
				});
			});

		});

		//使用Mocha的断言
		describe('Comparing strings', function(){

			describe('when comparing the same strings', function(){
				it('should return true', function(){//一个it代表一个测试的用例单元，用于测试某一个类型的功能点

					//比较运算符===检查值是否是相同的值以及是否是相同的类型，建议只使用===不用==
					assert.strictEqual('hello', 'hello');//类似===的比较
					//为了避免javascript的特质而出现问题，默认应使用assert.strictEqual而不是assert.equal
					//assert.equal("8",8);为true
					//assert.strictEqual("8",8);为false
					//assert.equal(0,'');为true
					//assert.strictEqual(0,'');为false
				});
			});
			describe('when comparing the different strings', function(){
				it('should return false', function(){

					assert.notStrictEqual('hello', 'there');

					//typeof addr === 'string'
				});
			});
		});
		//使用Mocha的异步测试
		describe('Async testing', function(){
			describe('When using fs.stat on a file', function(){
				it('should not be empty', function(done){
					fs.stat('test.txt', function(err, stat){
						assert.notEqual(stat.size, 0);
						done();//异步测试中使用done()回调方法表示测试完成
					});
				});
			});
		});

		after(function(done){//测试用例结束后做的事情，比如清除测试用例之前创建的变量，或数据库额外操作等等收尾工作
			done();
		});
	});
});
//命令行里通过grunt test进行测试


//-----------------------------------------------------------------------------------------------------------------------------------
// function someFunction(){
// 	return undefinedVar;//undefined
// }
// function notDefined(){
// 	console.trace();//此位置的堆栈内的位置踪迹（某个点的函数或方法调用清单），堆栈跟踪让开发人员可以了解到脚本如何执行到某个点，并追踪到问题发生的位置
// 	try{
// 		someFunction();//now defined
// 	}catch(e){
// 		console.error(e);//记录错误的类型信息抛出以及问题的确切所在[ReferenceError: undefinedVar is not defined]
// 	}
// }
// notDefined();