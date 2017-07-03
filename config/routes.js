var Index = require('../app/controllers/index');
var User = require('../app/controllers/user');
var Movie = require('../app/controllers/movie');
var Comment = require('../app/controllers/comment');
var Category = require('../app/controllers/category');

var multipart = require('connect-multiparty');//用于处理文件上传类型（enctype="multipart/form-data"）的表单提交的中间件
var multipartMiddleware = multipart();//变成一个处理文件上传类型表单的中间件

module.exports = function(app){

	//预处理（第一个执行的方法）
	app.use(function(req, res, next){

		var _user = req.session.user;//session中获取user对象

		app.locals.user = _user;//将user对象放在本地变量中，在渲染页面时再获取本地变量中的user对象

		next();//往下走
	});

	//给路由匹配控制器

	//Index
	app.get('/', Index.index);

	//User
	app.post('/user/signin', User.signin);//弹窗登录

	app.post('/user/signup', User.signup);//弹窗注册

	app.get('/signin', User.showSignin);//显示页面登录页面

	app.get('/signup', User.showSignup);//显示页面注册页面

	app.get('/admin/user/list', User.signinRequired, User.adminRequired, User.list);//查看此页面需要1.已登录状态，2.管理员权限

	app.get('/logout', User.logout);//登出

	//Movie
	app.get('/movie/:id/find', Movie.detail);

	app.get('/admin/movie/new', User.signinRequired, User.adminRequired, Movie.new);//路径中带admin的都是后台管理页面，需要管理员权限才能访问

	app.get('/admin/movie/update/:id', User.signinRequired, User.adminRequired, Movie.update)

	app.post('/admin/movie', multipartMiddleware, User.signinRequired, User.adminRequired,Movie.savePoster, Movie.save);//先执行处理文件上传表单中间件，再执行文件上传（Movie.savePoster）逻辑中间件，完成后再执行保存或修改（Movie.save）电影中间件

	app.get('/admin/movie/list', User.signinRequired, User.adminRequired, Movie.list);

	app.delete('/admin/movie/list', User.signinRequired, User.adminRequired, Movie.delete);

	//Comment 评论
	app.post('/user/comment', User.signinRequired, Comment.save);

	//Category 分类
	app.get('/admin/category/new', User.signinRequired, User.adminRequired, Category.new);

	app.post('/admin/category', User.signinRequired, User.adminRequired, Category.save);

	app.get('/admin/category/list', User.signinRequired, User.adminRequired, Category.list);

	//results
	app.get('/results', Index.search);

	//通配符匹配的结果处理
	app.get('/zhida_*',function(req, res){
		
	});

}