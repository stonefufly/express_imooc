var User = require('../models/user.js');//获取user模型
var Q = require('q');
var credentials = require('../../lib/credentials.js');

//弹窗登录
exports.signin = function(req, res){

	var _user = req.body.user;
	var name = _user.name;
	var password = _user.password;
	//console.log('>>>>>>>>'+JSON.stringify(req.cookie.userid));

	User.findOne({name:name},function(err, user){
		if(err){
			console.log(err);
		}
		if(!user){
			//无此用户名，登录失败
			console.log('here is not have this name');
			return res.redirect(303,'/signup');
		}

		user.comparePassword(password, function(err, isMatch){
			if(err){
				console.log(err);
			}
			if(isMatch){
				//登录成功
				console.log('password is matched');

				//将user存到session中
				req.session.user = user;

				return res.redirect(303,'/');
			}else{
				//密码不正确，登录失败
				console.log('password is not matched');
				return res.redirect(303,'/signin');
			}
		});
	});
};
//弹窗注册
exports.signup = function(req, res){

	var _user = req.body.user;
	//console.log(_user);
	//如果提交的用户名重复的话，mongooseDB会报错，所以要先判断用户名是否重复
	User.findOne({name:_user.name},function(err, user){
		if(err){
			console.log(err);
		}
		//console.log(JSON.stringify(user));
		if(user){
			//如果用户名已经存在
			return res.redirect('/signin');
		}else{
			user = new User(_user);

			user.save(function(err, user){
				if(err){
					console.log(err);
				}
				//console.log(user);
				res.redirect('/');
			});
		}
	});
	
};

//logout登出
exports.logout = function(req, res){

	//删除session中的user对象
	delete req.session.user;
	//删除本地变量中的user对象
	//delete app.locals.user;

	res.redirect('/');
};

//userlist page
exports.list = function(req,res){
	User.fetch(function(err,users){
		if(err){
			console.log(err);
		}

		res.render('userlist',{
			title:'imooc 用户列表页',
			users: users
		});
	});
};

//midware for user
exports.signinRequired = function(req, res, next){

	var user = req.session.user;
	if(!user){
		//用户未登录
		return res.redirect('/signin');
	}
	
	next();
}
exports.adminRequired = function(req, res, next){

	var user = req.session.user;
	if(user.role <= 10){
		//无管理员权限
		return res.redirect('/signin');
	}
	
	next();
}
exports.dealersMapData = function(req, res){

	res.render('dealers_map', { baiduApiKey: credentials.baiduApiKey });
}