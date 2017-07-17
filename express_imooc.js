var express = require('express'),
	app = express(),//express实例赋给app变量
	http = require('http'),
	path = require('path'),
	fs = require('fs'),
	session = require('express-session'),
	mongoStore = require('connect-mongo')(session),
	bodyParser = require('body-parser'),//这个中间件能将post请求中的req.body的内容初始化为一个对象
	favicon = require('serve-favicon'),//网页的logo
	mongoose = require('mongoose'),
	credentials = require('./lib/credentials.js'),
	weather = require('./lib/weather.js'),
	initDealersMap = require('./lib/initDealersMap.js');

//var serveStatic = require('serve-static');//处理静态资源

app.set('port', process.env.PORT || 3000);//process是全局对象，如果process.env.PORT（环境变量里的PORT对应的值）没有，则使用默认值3000端口

// use domains for better error handling
//---处理未捕获异常的中间件（放在所有其他路由或中间件前）
//出现未捕获异常，服务器只能关闭（死掉），只能尽可能正常的关闭服务器，并且有个故障转移机制，最容易的故障转移机制是使用集群，如果你的程序是运行在集群模式下，当一个工作线程死掉后，主线程会繁衍另一个工作线程来取代它
app.use(function(req, res, next){
    // create a domain for this request
    //为每个请求创建一个域（用域是保持Node正常运行的根本）
    //一个域基本上是一个执行上下文，它会捕获在其中发生的错误
    //每个请求都在一个域中处理是种好的做法，这样你可以追踪那个请求中所有的未捕获错误并作出相应的响应（正常的关闭服务器）
    var domain = require('domain').create();
    // 处理这个域中的错误
    domain.on('error', function(err){
        console.error('DOMAIN ERROR CAUGHT\n', err.stack);
        try {
            // 在5秒内进行故障保护关机
            //确立关闭服务器的截止时间，允许服务器在5秒内响应处理中的请求（如果它可以）
            //如果你有多个工作线程，在关闭前就有了更多的回旋余地，让垂死的工作线程服务剩余的请求
            setTimeout(function(){
                console.error('Failsafe shutdown.');
                process.exit(1);
            }, 5000);//5秒时间这个数值取决于你的程序，如果程序经常有长请求，应该给更多的时间

            // 从集群中断开（如果在集群中），以防止集群给我们分配更多的请求
            var worker = require('cluster').worker;
            if(worker) worker.disconnect();

            // 停止接收新请求（明确告诉服务器，不再接受新的连接）
            server.close();

            try {
                // 尝试使用Express错误处理路由，来响应产生错误的请求
                next(err);
            } catch(error){
                // 如果Express错误路由失效（抛出错误），尝试返回普通文本响应
                console.error('Express error mechanism failed.\n', error.stack);
                res.statusCode = 500;
                res.setHeader('content-type', 'text/plain');
                res.end('Server error.');
            }
        } catch(error){
        	//如果全部失败了，则记录错误（客户端得不到响应，最终会超时）
            console.error('Unable to send 500 response.\n', error.stack);
        }
    });

    // 向域中添加请求和响应对象（允许那些对象上的所有方法抛出的错误都由域处理）
    domain.add(req);
    domain.add(res);

    // 执行该域中剩余的请求链（在域的上下文中运行管道中的下一个中间件）
    //注意，这可以有效的运行域中管道里的所有中间件，因为对next()的调用是链起来的
    domain.run(next);
});
//---

//闪出消息
//var flash = require('connect-flash');

//连接数据库
var dbUrl = 'mongodb://localhost:27017/local';

mongoose.Promise = global.Promise;
var opts = {
	server: {
		socketOptions: {keepAlive: 1}//指定keepAlive选项以防止长期运行的应用程序（比如网站）出现数据库连接错误
	}
}
switch(app.get('env')){
	case 'development'://开发模式（默认模式）
		mongoose.connect(credentials.mongo.development.connectiondbUrl, opts, function(err){
			if(!err){
				console.log('connected to MongoDB in development');
			}else{
				throw err;
			}
		});
		break;
	case 'production'://生产模式
		mongoose.connect(credentials.mongo.production.connectiondbUrl, opts, function(err){
			if(!err){
				console.log('connected to MongoDB in production');
			}else{
				throw err;
			}
		});
		break;
	default:
		throw new Error('Unknown execution environment: '+ app.get('env'));
}


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

//通过调用app.use向管道中插入中间件
//中间件必须是一个函数

//bodyParser Module来做文件解析, 均支持自动的解析gzip和 zlib。
//urlencoded解析body中的urlencoded字符， 只支持utf-8的编码的字符,也支持自动的解析gzip和 zlib
//.json()这个方法返回一个仅仅用来解析json格式的中间件，能接受任何body中任何Unicode编码的字符。
app.use(bodyParser.urlencoded({ extended: true }));//表单提交中将表单中的数据进行格式化  [[改为true页面的name="movie[_id]"才能通过req.body.movie._id获取到]]
app.use(bodyParser.json());

//static中间件可以将一个或多个目录指派为包含静态资源的目录，其中资源不经过任何特殊处理直接发送到客户端，其中可放图片，css文件，客户端js文件之类的资源
//static中间件加在所有路由之前
//static中间件相当于给你想要发送的所有静态文件创建了一个路由，渲染文件并发送给客户端
//app.use(serveStatic(path.join(__dirname, 'public')));//样式和脚本的请求位置（public目录下查找），public目录中所有文件直接对外开放
app.use(express.static(__dirname+'/public'))

//session
//app.use(cookieParser('secret'));//cookie解析的中间件，有了cookieParser后session才能正常用,但是1.5版本后session不再依赖cookie-parser
app.use(session({//用内存存储会话数据(session)不适用于生产环境，所以用mongoDB来存储会话
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

//console.log('imooc started on port '+ port);

//var env = process.env.NODE_ENV || 'development';//如果process.env.NODE_ENV（环境变量里的NODE_ENV对应的值）没有，则使用默认值'development'

switch(app.get('env')){//判断程序的执行环境

	case 'development':
		//紧凑的，彩色的开发日志
		app.use(require('morgan')('dev'));

		app.set('showStackError',true);//使屏幕上可以打印出错误

		app.locals.pretty = true;//设置使页面上的源码都是格式化后的可读性好点

		mongoose.set('debug',true);//设置数据库的debug调试日志信息

		break;
	case 'production':
		//模块express-logger支持日志循环（每24小时复制一次，然后开始新的日志，防止日志文件无限制地增长）
		//express-logger输出的日志使用的是格林尼治标准时间（格林尼治标准时间+8小时=北京时间）
		app.use(require('express-logger')({path: __dirname + '/log/requests.log'}));
		break;
}

//在路由前添加此中间件可以看到不同工作线程处理不同请求的证据（用多应用集群扩展的时候）
app.use(function(req, res, next){
	var cluster = require('cluster');
	//用浏览器连接应用程序，刷新几次，能看到在每个请求上得到不同的工作线程
	if(cluster.isWorker) console.log('Worker %d received request', cluster.worker.id);
	next();
});

//---这个路由会制造未捕获异常（出现未捕获异常，服务器只能关闭（死掉））
app.get('/epic-fail', function(req, res){
    process.nextTick(function(){//process.nextTick跟调用没有参数的setTimeout非常像，但它的效率更高
        throw new Error('Kaboom!');
    });
});
//---

//设置路由（放在最底下）
require('./config/routes')(app);//加载路由文件，然后将express实例传递给路由文件的module.exports = function(app){，去设置路由。

//app.use是Express添加中间件的一种方法（是处理所有没有路由匹配路径的处理器）
//在Express中，路由和中间件的添加顺序至关重要，如果把404处理器放在所有路由上面，则访问这些URL得到的都是404


//这个中间件（自动视图处理器）用于可以通过例如/foo访问views/foo.jade
//注意：routes.js中的常规路由在此中间件之前，所以优先匹配routes.js中的路由（例如routes.js中的/foo路由优先匹配）
var autoViews = {};

app.use(function(req, res, next){

	var path = req.path.toLowerCase();//大写转小写

	//检查缓存，如果它在那里，渲染这个视图
	if(autoViews[path]) return res.render(autoViews[path]);

	//如果它不在缓存里，那就看看有没有.jade文件能匹配
	if(fs.existsSync(__dirname + '/app/views/pages' + path + '.jade')){

		autoViews[path] = path.replace(/^\//, '');//将path前面的/去掉
		return res.render(autoViews[path]);
	}
	//没发现视图，转到404处理器
	next();
});

//---在所有路由后面添加错误处理器
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
	// 	//出错时给开发者发送email通知
	// 	emailService.emailError('500错误', __filename, err);

	//res.type('text/plain');
	res.status(500);
	//res.send('500 - Server Error');

	res.render('500');
});
//---

//初始化天气缓存
weather();

//初始化代理商地图数据
initDealersMap(fs);

//---应用集群扩展
var server;

function startServer() {
    server = http.createServer(app).listen(app.get('port'), function(){
      console.log( 'Express started in %s mode on http://localhost:%d; press Ctrl-C to terminate.' ,app.get('env'), app.get('port'));
    });
}

if(require.main === module){//当直接运行脚本时，require.main === module是true，如果它是false，表明你的脚本是另外一个脚本用require加载进来的
    //应用程序直接运行（node app.js），启动应用服务器
    startServer();
} else {
    //应用程序作为一个模块通过“require”引入：导出函数
    //创建服务器
    module.exports = startServer;
}
// app.listen(app.get('port'), function(){
// 	console.log('Express started in '+ app.get('env')+' mode on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
// });//监听端口

//---


//app.disable('x-powered-by');//禁用express的X-Powered-By头信息来提高安全性（开发完之后要打开注 释）

//生产模式下视图缓存会默认启用