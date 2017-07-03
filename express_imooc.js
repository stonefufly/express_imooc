var express = require('express');
var path = require('path');//

//var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');

var session = require('express-session');
var mongoStore = require('connect-mongo')(session);

var logger = require('morgan');//日志

//var serveStatic = require('serve-static');//处理静态资源

var app = express();//express实例赋给app变量

app.set('port', process.env.PORT || 3000);//process是全局对象，如果process.env.PORT（环境变量里的PORT对应的值）没有，则使用默认值3000

var bodyParser = require('body-parser');//这个中间件能将post请求中的req.body的内容初始化为一个对象

//网页的logo
var favicon = require('serve-favicon');

//闪出消息
//var flash = require('connect-flash');

var fs = require('fs');
var dbUrl = 'mongodb://localhost:27017/local';

mongoose.Promise = global.Promise;
mongoose.connect(dbUrl, function(err){
	if(!err){
		console.log('connected to MongoDB');
	}else{
		throw err;
	}
});

//加载所有模型（这样在其它文件就可以通过使用var User = mongoose.model('User');获取模型，而不再用var User = require('../../app/models/user');获取模型）
var models_path = __dirname + '/app/models';//所有模型所在的目录

var walk = function(path){//遍历模型所在的目录
	fs
	.readdirSync(path)
	.forEach(function(file){//遍历目录里的所有文件或目录
		var newPath = path + '/' + file;
		var stat = fs.statSync(newPath);

		if(stat.isFile()){
			//如果是个文件
			if(/(.*)\.(js|coffee)/.test(file)){
				//同时又是个js文件或coffee文件
				
				require(newPath);//加载进来
			}
		}
		else if(stat.isDirectory()){
			//如果是个目录，则继续遍历
			walk(newPath);
		}
	});
};
walk(models_path);//开始遍历目录

//other
app.set('views','./app/views/pages');//设置视图的根目录
app.set('view engine','jade');//设置默认的摸板引擎
app.use(bodyParser.urlencoded({ extended: true }));//表单提交中将表单中的数据进行格式化  [[改为true页面的name="movie[_id]"才能通过req.body.movie._id获取到]]

//static中间件可以将一个或多个目录指派为包含静态资源的目录，其中资源不经过任何特殊处理直接发送到客户端，其中可放图片，css文件，客户端js文件之类的资源
//static中间件加在所有路由之前
//static中间件相当于给你想要发送的所有静态文件创建了一个路由，渲染文件并发送给客户端
//app.use(serveStatic(path.join(__dirname, 'public')));//样式和脚本的请求位置（public目录下查找），public目录中所有文件直接对外开放
app.use(express.static(__dirname+'/public'))

//session
//app.use(cookieParser('secret'));//cookie解析的中间件，有了cookieParser后session才能正常用,但是1.5版本后session不再依赖cookie-parser
app.use(session({
	secret: 'imooc',//用户保护会话安全的密码，可以是任何字符串
	store: new mongoStore({
		url: dbUrl,
		collection: 'sessions'//存储在数据库中的sessions表中
	}),
	resave: false,
	saveUninitialized: true
}));

//闪出消息
//app.use(session({cookie: { maxAge: 60000 }}));
//app.use(flash());

//网页的logo
app.use(favicon(__dirname + '/public/img/favicon.ico'))//__dirname代表该执行文件的父目录，注意是双下划线，否则会爆出错误

app.locals.moment = require('moment');

app.listen(app.get('port'), function(){
	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});//监听端口

//console.log('imooc started on port '+ port);

var env = process.env.NODE_ENV || 'development';//如果process.env.NODE_ENV（环境变量里的NODE_ENV对应的值）没有，则使用默认值'development'

if('development' === env){//获取环境变量是否是开发环境（development）

	app.set('showStackError',true);//使屏幕上可以打印出错误
	
	app.use(logger(':method :url :status'));//使用express的一个日志中间件记录（请求的类型：请求的路径：请求的状态值）

	app.locals.pretty = true;//设置使页面上的源码都是格式化后的可读性好点

	mongoose.set('debug',true);//设置数据库的debug调试日志信息
}

//设置路由（放在最底下）
require('./config/routes')(app);//加载路由文件，然后将express实例传递给路由文件的module.exports = function(app){，去设置路由。

//app.use是Express添加中间件的一种方法（是处理所有没有路由匹配路径的处理器）
//在Express中，路由和中间件的添加顺序至关重要，如果把404处理器放在所有路由上面，则访问这些URL得到的都是404

//定制404 catch-all 处理器(中间件)
app.use(function(req, res){
	//res.type('text/plain');
	res.status(404);
	//res.send('404 - Not Found');

	res.render('404');
});
//定制500错误处理器(中间件)
app.use(function(err, req, res, next){
	console.error(err.stack);
	//res.type('text/plain');
	res.status(500);
	//res.send('500 - Server Error');

	res.render('500');
});